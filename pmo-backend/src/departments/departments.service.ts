import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { createPaginatedResponse, PaginatedResponse } from '../common/dto';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  QueryDepartmentDto,
  AssignUserDto,
} from './dto';

@Injectable()
export class DepartmentsService {
  private readonly logger = new Logger(DepartmentsService.name);
  private readonly ALLOWED_SORTS = ['created_at', 'updated_at', 'name', 'status', 'code'];

  constructor(private readonly db: DatabaseService) {}

  async findAll(query: QueryDepartmentDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20, sort = 'created_at', order = 'desc' } = query;
    const offset = (page - 1) * limit;

    const sortColumn = this.ALLOWED_SORTS.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const conditions: string[] = ['d.deleted_at IS NULL'];
    const params: any[] = [];
    let paramIndex = 1;

    if (query.status) {
      conditions.push(`d.status = $${paramIndex++}`);
      params.push(query.status);
    }

    if (query.parent_id) {
      conditions.push(`d.parent_id = $${paramIndex++}`);
      params.push(query.parent_id);
    }

    if (query.name) {
      conditions.push(`d.name ILIKE $${paramIndex++}`);
      params.push(`%${query.name}%`);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query(
      `SELECT COUNT(*) FROM departments d WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await this.db.query(
      `SELECT d.id, d.name, d.code, d.description, d.parent_id, d.head_id,
              d.email, d.phone, d.status, d.created_at, d.updated_at,
              u.first_name || ' ' || u.last_name as head_name,
              p.name as parent_name
       FROM departments d
       LEFT JOIN users u ON d.head_id = u.id
       LEFT JOIN departments p ON d.parent_id = p.id
       WHERE ${whereClause}
       ORDER BY d.${sortColumn} ${sortOrder}
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset],
    );

    return createPaginatedResponse(dataResult.rows, total, page, limit);
  }

  async findOne(id: string): Promise<any> {
    const result = await this.db.query(
      `SELECT d.*,
              u.first_name || ' ' || u.last_name as head_name,
              u.email as head_email,
              p.name as parent_name
       FROM departments d
       LEFT JOIN users u ON d.head_id = u.id
       LEFT JOIN departments p ON d.parent_id = p.id
       WHERE d.id = $1 AND d.deleted_at IS NULL`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return result.rows[0];
  }

  async create(dto: CreateDepartmentDto, userId: string): Promise<any> {
    // Check for duplicate code if provided
    if (dto.code) {
      const existing = await this.db.query(
        `SELECT id FROM departments WHERE code = $1 AND deleted_at IS NULL`,
        [dto.code],
      );
      if (existing.rows.length > 0) {
        throw new ConflictException(`Department code ${dto.code} already exists`);
      }
    }

    // Validate parent_id if provided
    if (dto.parent_id) {
      const parent = await this.db.query(
        `SELECT id FROM departments WHERE id = $1 AND deleted_at IS NULL`,
        [dto.parent_id],
      );
      if (parent.rows.length === 0) {
        throw new BadRequestException(`Parent department with ID ${dto.parent_id} not found`);
      }
    }

    // Validate head_id if provided
    if (dto.head_id) {
      const head = await this.db.query(
        `SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL`,
        [dto.head_id],
      );
      if (head.rows.length === 0) {
        throw new BadRequestException(`User with ID ${dto.head_id} not found`);
      }
    }

    const result = await this.db.query(
      `INSERT INTO departments (name, code, description, parent_id, head_id, email, phone, status, metadata, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        dto.name,
        dto.code || null,
        dto.description || null,
        dto.parent_id || null,
        dto.head_id || null,
        dto.email || null,
        dto.phone || null,
        dto.status || 'ACTIVE',
        dto.metadata ? JSON.stringify(dto.metadata) : null,
        userId,
      ],
    );

    this.logger.log(`DEPARTMENT_CREATED: id=${result.rows[0].id}, by=${userId}`);
    return result.rows[0];
  }

  async update(id: string, dto: UpdateDepartmentDto, userId: string): Promise<any> {
    await this.findOne(id);

    // Check for duplicate code if updating
    if (dto.code) {
      const existing = await this.db.query(
        `SELECT id FROM departments WHERE code = $1 AND id != $2 AND deleted_at IS NULL`,
        [dto.code, id],
      );
      if (existing.rows.length > 0) {
        throw new ConflictException(`Department code ${dto.code} already exists`);
      }
    }

    // Validate parent_id if provided and check for cycles
    if (dto.parent_id) {
      if (dto.parent_id === id) {
        throw new BadRequestException('Department cannot be its own parent');
      }
      const parent = await this.db.query(
        `SELECT id FROM departments WHERE id = $1 AND deleted_at IS NULL`,
        [dto.parent_id],
      );
      if (parent.rows.length === 0) {
        throw new BadRequestException(`Parent department with ID ${dto.parent_id} not found`);
      }
      // Check for cycles
      const hasCycle = await this.checkCycle(id, dto.parent_id);
      if (hasCycle) {
        throw new BadRequestException('Setting this parent would create a circular reference');
      }
    }

    // Validate head_id if provided
    if (dto.head_id) {
      const head = await this.db.query(
        `SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL`,
        [dto.head_id],
      );
      if (head.rows.length === 0) {
        throw new BadRequestException(`User with ID ${dto.head_id} not found`);
      }
    }

    const fields = Object.keys(dto).filter((k) => dto[k] !== undefined);
    if (fields.length === 0) {
      return this.findOne(id);
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map((f) => (f === 'metadata' ? JSON.stringify(dto[f]) : dto[f]));

    const result = await this.db.query(
      `UPDATE departments
       SET ${setClause}, updated_by = $${fields.length + 1}, updated_at = NOW()
       WHERE id = $${fields.length + 2} AND deleted_at IS NULL
       RETURNING *`,
      [...values, userId, id],
    );

    this.logger.log(`DEPARTMENT_UPDATED: id=${id}, by=${userId}, fields=[${fields.join(',')}]`);
    return result.rows[0];
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id);

    // Check if department has children
    const children = await this.db.query(
      `SELECT id FROM departments WHERE parent_id = $1 AND deleted_at IS NULL`,
      [id],
    );
    if (children.rows.length > 0) {
      throw new BadRequestException('Cannot delete department with child departments');
    }

    await this.db.query(
      `UPDATE departments SET deleted_at = NOW(), deleted_by = $1 WHERE id = $2`,
      [userId, id],
    );

    this.logger.log(`DEPARTMENT_DELETED: id=${id}, by=${userId}`);
  }

  // --- User Assignment ---
  async findUsers(departmentId: string): Promise<any[]> {
    await this.findOne(departmentId);

    const result = await this.db.query(
      `SELECT ud.user_id, ud.is_primary, ud.created_at,
              u.email, u.first_name, u.last_name
       FROM user_departments ud
       JOIN users u ON ud.user_id = u.id
       WHERE ud.department_id = $1 AND u.deleted_at IS NULL
       ORDER BY ud.is_primary DESC, u.last_name ASC`,
      [departmentId],
    );

    return result.rows;
  }

  async assignUser(departmentId: string, dto: AssignUserDto, userId: string): Promise<any> {
    await this.findOne(departmentId);

    // Check if user exists
    const user = await this.db.query(
      `SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [dto.user_id],
    );
    if (user.rows.length === 0) {
      throw new BadRequestException(`User with ID ${dto.user_id} not found`);
    }

    // Check if already assigned
    const existing = await this.db.query(
      `SELECT user_id FROM user_departments WHERE user_id = $1 AND department_id = $2`,
      [dto.user_id, departmentId],
    );
    if (existing.rows.length > 0) {
      throw new ConflictException(`User is already assigned to this department`);
    }

    const result = await this.db.query(
      `INSERT INTO user_departments (user_id, department_id, is_primary, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [dto.user_id, departmentId, dto.is_primary || false, userId],
    );

    this.logger.log(`USER_ASSIGNED_TO_DEPARTMENT: user=${dto.user_id}, department=${departmentId}, by=${userId}`);
    return result.rows[0];
  }

  async removeUser(departmentId: string, targetUserId: string, userId: string): Promise<void> {
    await this.findOne(departmentId);

    const result = await this.db.query(
      `DELETE FROM user_departments WHERE user_id = $1 AND department_id = $2`,
      [targetUserId, departmentId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException(`User is not assigned to this department`);
    }

    this.logger.log(`USER_REMOVED_FROM_DEPARTMENT: user=${targetUserId}, department=${departmentId}, by=${userId}`);
  }

  // --- Helper Methods ---
  private async checkCycle(departmentId: string, newParentId: string): Promise<boolean> {
    // Traverse up the parent chain from newParentId to see if we reach departmentId
    let currentId = newParentId;
    const visited = new Set<string>();

    while (currentId) {
      if (currentId === departmentId) {
        return true; // Cycle detected
      }
      if (visited.has(currentId)) {
        return false; // Already checked this path
      }
      visited.add(currentId);

      const result = await this.db.query(
        `SELECT parent_id FROM departments WHERE id = $1 AND deleted_at IS NULL`,
        [currentId],
      );

      if (result.rows.length === 0) {
        return false;
      }

      currentId = result.rows[0].parent_id;
    }

    return false;
  }
}
