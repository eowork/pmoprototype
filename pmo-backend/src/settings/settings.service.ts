import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { createPaginatedResponse, PaginatedResponse } from '../common/dto';
import { CreateSettingDto, UpdateSettingDto, QuerySettingDto } from './dto';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);
  private readonly ALLOWED_SORTS = ['created_at', 'updated_at', 'setting_key', 'setting_group', 'is_public', 'data_type'];

  constructor(private readonly db: DatabaseService) {}

  async findAll(query: QuerySettingDto, isAdmin: boolean): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20, sort = 'setting_group', order = 'asc' } = query;
    const offset = (page - 1) * limit;

    const sortColumn = this.ALLOWED_SORTS.includes(sort) ? sort : 'setting_group';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const conditions: string[] = ['deleted_at IS NULL'];
    const params: any[] = [];
    let paramIndex = 1;

    // Staff can only see public settings
    if (!isAdmin) {
      conditions.push('is_public = TRUE');
    } else if (query.is_public !== undefined) {
      conditions.push(`is_public = $${paramIndex++}`);
      params.push(query.is_public);
    }

    if (query.group) {
      conditions.push(`setting_group = $${paramIndex++}`);
      params.push(query.group);
    }

    if (query.key) {
      conditions.push(`setting_key ILIKE $${paramIndex++}`);
      params.push(`%${query.key}%`);
    }

    if (query.data_type) {
      conditions.push(`data_type = $${paramIndex++}`);
      params.push(query.data_type);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query(
      `SELECT COUNT(*) FROM system_settings WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await this.db.query(
      `SELECT id, setting_key, setting_value, setting_group, data_type, is_public, description, created_at, updated_at
       FROM system_settings
       WHERE ${whereClause}
       ORDER BY ${sortColumn} ${sortOrder}, setting_key ASC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset],
    );

    return createPaginatedResponse(dataResult.rows, total, page, limit);
  }

  async findByKey(key: string, isAdmin: boolean): Promise<any> {
    let query = `SELECT * FROM system_settings WHERE setting_key = $1 AND deleted_at IS NULL`;
    const params: any[] = [key];

    // Staff can only see public settings
    if (!isAdmin) {
      query += ' AND is_public = TRUE';
    }

    const result = await this.db.query(query, params);

    if (result.rows.length === 0) {
      throw new NotFoundException(`Setting with key ${key} not found`);
    }

    return result.rows[0];
  }

  async findByGroup(group: string, isAdmin: boolean): Promise<any[]> {
    let query = `SELECT id, setting_key, setting_value, setting_group, data_type, is_public, description
                 FROM system_settings
                 WHERE setting_group = $1 AND deleted_at IS NULL`;
    const params: any[] = [group];

    // Staff can only see public settings
    if (!isAdmin) {
      query += ' AND is_public = TRUE';
    }

    query += ' ORDER BY setting_key ASC';

    const result = await this.db.query(query, params);
    return result.rows;
  }

  async create(dto: CreateSettingDto, userId: string): Promise<any> {
    // Check for duplicate key
    const existing = await this.db.query(
      `SELECT id FROM system_settings WHERE setting_key = $1 AND deleted_at IS NULL`,
      [dto.setting_key],
    );
    if (existing.rows.length > 0) {
      throw new ConflictException(`Setting key ${dto.setting_key} already exists`);
    }

    const result = await this.db.query(
      `INSERT INTO system_settings (setting_key, setting_value, setting_group, data_type, is_public, description, metadata, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        dto.setting_key,
        dto.setting_value || null,
        dto.setting_group,
        dto.data_type,
        dto.is_public || false,
        dto.description || null,
        dto.metadata ? JSON.stringify(dto.metadata) : null,
        userId,
      ],
    );

    this.logger.log(`SETTING_CREATED: key=${dto.setting_key}, by=${userId}`);
    return result.rows[0];
  }

  async updateByKey(key: string, dto: UpdateSettingDto, userId: string): Promise<any> {
    // First check if setting exists
    const existing = await this.db.query(
      `SELECT id FROM system_settings WHERE setting_key = $1 AND deleted_at IS NULL`,
      [key],
    );
    if (existing.rows.length === 0) {
      throw new NotFoundException(`Setting with key ${key} not found`);
    }

    const fields = Object.keys(dto).filter((k) => dto[k] !== undefined);
    if (fields.length === 0) {
      return this.findByKey(key, true);
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map((f) => (f === 'metadata' ? JSON.stringify(dto[f]) : dto[f]));

    const result = await this.db.query(
      `UPDATE system_settings
       SET ${setClause}, updated_by = $${fields.length + 1}, updated_at = NOW()
       WHERE setting_key = $${fields.length + 2} AND deleted_at IS NULL
       RETURNING *`,
      [...values, userId, key],
    );

    this.logger.log(`SETTING_UPDATED: key=${key}, by=${userId}, fields=[${fields.join(',')}]`);
    return result.rows[0];
  }

  async removeByKey(key: string, userId: string): Promise<void> {
    const existing = await this.db.query(
      `SELECT id FROM system_settings WHERE setting_key = $1 AND deleted_at IS NULL`,
      [key],
    );
    if (existing.rows.length === 0) {
      throw new NotFoundException(`Setting with key ${key} not found`);
    }

    await this.db.query(
      `UPDATE system_settings SET deleted_at = NOW(), deleted_by = $1 WHERE setting_key = $2`,
      [userId, key],
    );

    this.logger.log(`SETTING_DELETED: key=${key}, by=${userId}`);
  }
}
