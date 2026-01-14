import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { createPaginatedResponse, PaginatedResponse } from '../common/dto';
import { CreateProjectDto, UpdateProjectDto, QueryProjectDto } from './dto';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);
  private readonly ALLOWED_SORTS = ['created_at', 'title', 'status', 'start_date', 'end_date', 'project_code'];

  constructor(private readonly db: DatabaseService) {}

  async findAll(query: QueryProjectDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20, sort = 'created_at', order = 'desc' } = query;
    const offset = (page - 1) * limit;

    const sortColumn = this.ALLOWED_SORTS.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const conditions: string[] = ['deleted_at IS NULL'];
    const params: any[] = [];
    let paramIndex = 1;

    if (query.type) {
      conditions.push(`project_type = $${paramIndex++}`);
      params.push(query.type);
    }
    if (query.status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(query.status);
    }
    if (query.campus) {
      conditions.push(`campus = $${paramIndex++}`);
      params.push(query.campus);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query(
      `SELECT COUNT(*) FROM projects WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await this.db.query(
      `SELECT id, project_code, title, description, project_type, start_date, end_date,
              status, budget, campus, created_at, updated_at
       FROM projects
       WHERE ${whereClause}
       ORDER BY ${sortColumn} ${sortOrder}
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset],
    );

    return createPaginatedResponse(dataResult.rows, total, page, limit);
  }

  async findOne(id: string): Promise<any> {
    const result = await this.db.query(
      `SELECT * FROM projects WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return result.rows[0];
  }

  async create(dto: CreateProjectDto, userId: string): Promise<any> {
    // Check for duplicate project_code
    const existing = await this.db.query(
      `SELECT id FROM projects WHERE project_code = $1 AND deleted_at IS NULL`,
      [dto.project_code],
    );
    if (existing.rows.length > 0) {
      throw new ConflictException(`Project code ${dto.project_code} already exists`);
    }

    const result = await this.db.query(
      `INSERT INTO projects
       (project_code, title, description, project_type, start_date, end_date, status, budget, campus, metadata, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        dto.project_code,
        dto.title,
        dto.description,
        dto.project_type,
        dto.start_date,
        dto.end_date,
        dto.status,
        dto.budget,
        dto.campus,
        dto.metadata ? JSON.stringify(dto.metadata) : null,
        userId,
      ],
    );

    this.logger.log(`PROJECT_CREATED: id=${result.rows[0].id}, by=${userId}`);
    return result.rows[0];
  }

  async update(id: string, dto: UpdateProjectDto, userId: string): Promise<any> {
    await this.findOne(id);

    // Check for duplicate project_code if updating
    const dtoAny = dto as any;
    if (dtoAny.project_code) {
      const existing = await this.db.query(
        `SELECT id FROM projects WHERE project_code = $1 AND id != $2 AND deleted_at IS NULL`,
        [dtoAny.project_code, id],
      );
      if (existing.rows.length > 0) {
        throw new ConflictException(`Project code ${dtoAny.project_code} already exists`);
      }
    }

    const fields = Object.keys(dto).filter((k) => dto[k] !== undefined);
    if (fields.length === 0) {
      return this.findOne(id);
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map((f) => (f === 'metadata' ? JSON.stringify(dto[f]) : dto[f]));

    const result = await this.db.query(
      `UPDATE projects
       SET ${setClause}, updated_by = $${fields.length + 1}, updated_at = NOW()
       WHERE id = $${fields.length + 2} AND deleted_at IS NULL
       RETURNING *`,
      [...values, userId, id],
    );

    this.logger.log(`PROJECT_UPDATED: id=${id}, by=${userId}, fields=[${fields.join(',')}]`);
    return result.rows[0];
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id);

    await this.db.query(
      `UPDATE projects SET deleted_at = NOW(), deleted_by = $1 WHERE id = $2`,
      [userId, id],
    );

    this.logger.log(`PROJECT_DELETED: id=${id}, by=${userId}`);
  }
}
