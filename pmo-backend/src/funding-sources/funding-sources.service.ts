import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { createPaginatedResponse, PaginatedResponse } from '../common/dto';
import { CreateFundingSourceDto, UpdateFundingSourceDto, QueryFundingSourceDto } from './dto';

@Injectable()
export class FundingSourcesService {
  private readonly logger = new Logger(FundingSourcesService.name);
  private readonly ALLOWED_SORTS = ['created_at', 'updated_at', 'name'];

  constructor(private readonly db: DatabaseService) {}

  async findAll(query: QueryFundingSourceDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20, sort = 'created_at', order = 'desc' } = query;
    const offset = (page - 1) * limit;

    const sortColumn = this.ALLOWED_SORTS.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const conditions: string[] = ['deleted_at IS NULL'];
    const params: any[] = [];
    let paramIndex = 1;

    if (query.name) {
      conditions.push(`name ILIKE $${paramIndex++}`);
      params.push(`%${query.name}%`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query(
      `SELECT COUNT(*) FROM funding_sources WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await this.db.query(
      `SELECT id, name, description, created_at, updated_at
       FROM funding_sources
       WHERE ${whereClause}
       ORDER BY ${sortColumn} ${sortOrder}
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset],
    );

    return createPaginatedResponse(dataResult.rows, total, page, limit);
  }

  async findOne(id: string): Promise<any> {
    const result = await this.db.query(
      `SELECT * FROM funding_sources WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Funding source with ID ${id} not found`);
    }

    return result.rows[0];
  }

  async create(dto: CreateFundingSourceDto, userId: string): Promise<any> {
    // Check for duplicate name
    const existing = await this.db.query(
      `SELECT id FROM funding_sources WHERE name = $1 AND deleted_at IS NULL`,
      [dto.name],
    );
    if (existing.rows.length > 0) {
      throw new ConflictException(`Funding source name ${dto.name} already exists`);
    }

    const result = await this.db.query(
      `INSERT INTO funding_sources (name, description, metadata, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        dto.name,
        dto.description || null,
        dto.metadata ? JSON.stringify(dto.metadata) : null,
        userId,
      ],
    );

    this.logger.log(`FUNDING_SOURCE_CREATED: id=${result.rows[0].id}, by=${userId}`);
    return result.rows[0];
  }

  async update(id: string, dto: UpdateFundingSourceDto, userId: string): Promise<any> {
    await this.findOne(id);

    // Check for duplicate name if updating
    if (dto.name) {
      const existing = await this.db.query(
        `SELECT id FROM funding_sources WHERE name = $1 AND id != $2 AND deleted_at IS NULL`,
        [dto.name, id],
      );
      if (existing.rows.length > 0) {
        throw new ConflictException(`Funding source name ${dto.name} already exists`);
      }
    }

    const fields = Object.keys(dto).filter((k) => dto[k] !== undefined);
    if (fields.length === 0) {
      return this.findOne(id);
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map((f) => (f === 'metadata' ? JSON.stringify(dto[f]) : dto[f]));

    const result = await this.db.query(
      `UPDATE funding_sources
       SET ${setClause}, updated_by = $${fields.length + 1}, updated_at = NOW()
       WHERE id = $${fields.length + 2} AND deleted_at IS NULL
       RETURNING *`,
      [...values, userId, id],
    );

    this.logger.log(`FUNDING_SOURCE_UPDATED: id=${id}, by=${userId}, fields=[${fields.join(',')}]`);
    return result.rows[0];
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id);

    await this.db.query(
      `UPDATE funding_sources SET deleted_at = NOW(), deleted_by = $1 WHERE id = $2`,
      [userId, id],
    );

    this.logger.log(`FUNDING_SOURCE_DELETED: id=${id}, by=${userId}`);
  }
}
