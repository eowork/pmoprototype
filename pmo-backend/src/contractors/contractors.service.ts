import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { createPaginatedResponse, PaginatedResponse } from '../common/dto';
import { CreateContractorDto, UpdateContractorDto, QueryContractorDto } from './dto';

@Injectable()
export class ContractorsService {
  private readonly logger = new Logger(ContractorsService.name);
  private readonly ALLOWED_SORTS = ['created_at', 'updated_at', 'name', 'status'];

  constructor(private readonly db: DatabaseService) {}

  async findAll(query: QueryContractorDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20, sort = 'created_at', order = 'desc' } = query;
    const offset = (page - 1) * limit;

    const sortColumn = this.ALLOWED_SORTS.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const conditions: string[] = ['deleted_at IS NULL'];
    const params: any[] = [];
    let paramIndex = 1;

    if (query.status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(query.status);
    }
    if (query.name) {
      conditions.push(`name ILIKE $${paramIndex++}`);
      params.push(`%${query.name}%`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query(
      `SELECT COUNT(*) FROM contractors WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await this.db.query(
      `SELECT id, name, contact_person, email, phone, address, tin_number,
              registration_number, validity_date, status, created_at, updated_at
       FROM contractors
       WHERE ${whereClause}
       ORDER BY ${sortColumn} ${sortOrder}
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset],
    );

    return createPaginatedResponse(dataResult.rows, total, page, limit);
  }

  async findOne(id: string): Promise<any> {
    const result = await this.db.query(
      `SELECT * FROM contractors WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Contractor with ID ${id} not found`);
    }

    return result.rows[0];
  }

  async create(dto: CreateContractorDto, userId: string): Promise<any> {
    const result = await this.db.query(
      `INSERT INTO contractors
       (name, contact_person, email, phone, address, tin_number, registration_number,
        validity_date, status, metadata, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        dto.name,
        dto.contact_person || null,
        dto.email || null,
        dto.phone || null,
        dto.address || null,
        dto.tin_number || null,
        dto.registration_number || null,
        dto.validity_date || null,
        dto.status,
        dto.metadata ? JSON.stringify(dto.metadata) : null,
        userId,
      ],
    );

    this.logger.log(`CONTRACTOR_CREATED: id=${result.rows[0].id}, by=${userId}`);
    return result.rows[0];
  }

  async update(id: string, dto: UpdateContractorDto, userId: string): Promise<any> {
    await this.findOne(id);

    const fields = Object.keys(dto).filter((k) => dto[k] !== undefined);
    if (fields.length === 0) {
      return this.findOne(id);
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map((f) => (f === 'metadata' ? JSON.stringify(dto[f]) : dto[f]));

    const result = await this.db.query(
      `UPDATE contractors
       SET ${setClause}, updated_by = $${fields.length + 1}, updated_at = NOW()
       WHERE id = $${fields.length + 2} AND deleted_at IS NULL
       RETURNING *`,
      [...values, userId, id],
    );

    this.logger.log(`CONTRACTOR_UPDATED: id=${id}, by=${userId}, fields=[${fields.join(',')}]`);
    return result.rows[0];
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id);

    await this.db.query(
      `UPDATE contractors SET deleted_at = NOW(), deleted_by = $1 WHERE id = $2`,
      [userId, id],
    );

    this.logger.log(`CONTRACTOR_DELETED: id=${id}, by=${userId}`);
  }

  async updateStatus(id: string, status: string, userId: string): Promise<any> {
    await this.findOne(id);

    const result = await this.db.query(
      `UPDATE contractors
       SET status = $1, updated_by = $2, updated_at = NOW()
       WHERE id = $3 AND deleted_at IS NULL
       RETURNING *`,
      [status, userId, id],
    );

    this.logger.log(`CONTRACTOR_STATUS_UPDATED: id=${id}, status=${status}, by=${userId}`);
    return result.rows[0];
  }
}
