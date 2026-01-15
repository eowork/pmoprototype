import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';
import { createPaginatedResponse, PaginatedResponse } from '../common/dto';
import { CreateUserDto, UpdateUserDto, QueryUserDto, AssignRoleDto } from './dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly SALT_ROUNDS = 12;
  private readonly ALLOWED_SORTS = ['created_at', 'email', 'first_name', 'last_name', 'is_active'];

  constructor(private readonly db: DatabaseService) {}

  async findAll(query: QueryUserDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20, sort = 'created_at', order = 'desc' } = query;
    const offset = (page - 1) * limit;

    const sortColumn = this.ALLOWED_SORTS.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const conditions: string[] = ['u.deleted_at IS NULL'];
    const params: any[] = [];
    let paramIndex = 1;

    if (query.is_active !== undefined) {
      conditions.push(`u.is_active = $${paramIndex++}`);
      params.push(query.is_active);
    }

    if (query.search) {
      conditions.push(`(u.email ILIKE $${paramIndex} OR u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex})`);
      params.push(`%${query.search}%`);
      paramIndex++;
    }

    if (query.role) {
      conditions.push(`EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = u.id AND r.name = $${paramIndex++})`);
      params.push(query.role);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query(
      `SELECT COUNT(*) FROM users u WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await this.db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.avatar_url,
              u.is_active, u.last_login_at, u.created_at, u.updated_at,
              COALESCE(
                (SELECT json_agg(json_build_object('id', r.id, 'name', r.name, 'is_superadmin', ur.is_superadmin))
                 FROM user_roles ur JOIN roles r ON ur.role_id = r.id
                 WHERE ur.user_id = u.id),
                '[]'
              ) as roles
       FROM users u
       WHERE ${whereClause}
       ORDER BY u.${sortColumn} ${sortOrder}
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset],
    );

    return createPaginatedResponse(dataResult.rows, total, page, limit);
  }

  async findOne(id: string): Promise<any> {
    const result = await this.db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.avatar_url,
              u.is_active, u.last_login_at, u.failed_login_attempts,
              u.account_locked_until, u.metadata, u.created_at, u.updated_at
       FROM users u
       WHERE u.id = $1 AND u.deleted_at IS NULL`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const user = result.rows[0];

    // Get roles
    const rolesResult = await this.db.query(
      `SELECT r.id, r.name, ur.is_superadmin, ur.assigned_at
       FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = $1`,
      [id],
    );

    // Get permissions
    const permsResult = await this.db.query(
      `SELECT DISTINCT p.id, p.name, p.resource, p.action
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       JOIN user_roles ur ON rp.role_id = ur.role_id
       WHERE ur.user_id = $1`,
      [id],
    );

    return {
      ...user,
      roles: rolesResult.rows,
      permissions: permsResult.rows,
    };
  }

  async create(dto: CreateUserDto, adminId: string): Promise<any> {
    // Check for duplicate email
    const existing = await this.db.query(
      `SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL`,
      [dto.email],
    );

    if (existing.rows.length > 0) {
      throw new ConflictException(`User with email ${dto.email} already exists`);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    const result = await this.db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, avatar_url, is_active, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, email, first_name, last_name, phone, avatar_url, is_active, created_at`,
      [
        dto.email,
        passwordHash,
        dto.first_name,
        dto.last_name,
        dto.phone || null,
        dto.avatar_url || null,
        dto.is_active !== undefined ? dto.is_active : true,
        dto.metadata ? JSON.stringify(dto.metadata) : null,
      ],
    );

    this.logger.log(`USER_CREATED: id=${result.rows[0].id}, email=${dto.email}, by=${adminId}`);

    return result.rows[0];
  }

  async update(id: string, dto: UpdateUserDto, adminId: string): Promise<any> {
    // Verify user exists
    const existing = await this.db.query(
      `SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );

    if (existing.rows.length === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (dto.first_name !== undefined) {
      updates.push(`first_name = $${paramIndex++}`);
      values.push(dto.first_name);
    }
    if (dto.last_name !== undefined) {
      updates.push(`last_name = $${paramIndex++}`);
      values.push(dto.last_name);
    }
    if (dto.phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(dto.phone);
    }
    if (dto.avatar_url !== undefined) {
      updates.push(`avatar_url = $${paramIndex++}`);
      values.push(dto.avatar_url);
    }
    if (dto.is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(dto.is_active);
    }
    if (dto.metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`);
      values.push(JSON.stringify(dto.metadata));
    }
    if (dto.password) {
      const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
      updates.push(`password_hash = $${paramIndex++}`);
      updates.push(`last_password_change_at = NOW()`);
      values.push(passwordHash);
    }

    if (updates.length === 0) {
      return this.findOne(id);
    }

    updates.push(`updated_at = NOW()`);

    const result = await this.db.query(
      `UPDATE users SET ${updates.join(', ')}
       WHERE id = $${paramIndex} AND deleted_at IS NULL
       RETURNING id, email, first_name, last_name, phone, avatar_url, is_active, updated_at`,
      [...values, id],
    );

    this.logger.log(`USER_UPDATED: id=${id}, by=${adminId}`);

    return result.rows[0];
  }

  async remove(id: string, adminId: string): Promise<void> {
    const result = await this.db.query(
      `UPDATE users SET deleted_at = NOW(), deleted_by = $1
       WHERE id = $2 AND deleted_at IS NULL`,
      [adminId, id],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.logger.log(`USER_DELETED: id=${id}, by=${adminId}`);
  }

  // --- Role Management ---

  async assignRole(userId: string, dto: AssignRoleDto, adminId: string): Promise<any> {
    // Verify user exists
    const userExists = await this.db.query(
      `SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [userId],
    );
    if (userExists.rows.length === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Verify role exists
    const roleExists = await this.db.query(
      `SELECT id, name FROM roles WHERE id = $1 AND deleted_at IS NULL`,
      [dto.role_id],
    );
    if (roleExists.rows.length === 0) {
      throw new NotFoundException(`Role with ID ${dto.role_id} not found`);
    }

    // Check if already assigned
    const existing = await this.db.query(
      `SELECT user_id FROM user_roles WHERE user_id = $1 AND role_id = $2`,
      [userId, dto.role_id],
    );

    if (existing.rows.length > 0) {
      // Update is_superadmin if different
      if (dto.is_superadmin !== undefined) {
        await this.db.query(
          `UPDATE user_roles SET is_superadmin = $1 WHERE user_id = $2 AND role_id = $3`,
          [dto.is_superadmin, userId, dto.role_id],
        );
      }
      this.logger.log(`USER_ROLE_UPDATED: user=${userId}, role=${dto.role_id}, by=${adminId}`);
    } else {
      await this.db.query(
        `INSERT INTO user_roles (user_id, role_id, is_superadmin, assigned_by, created_by)
         VALUES ($1, $2, $3, $4, $4)`,
        [userId, dto.role_id, dto.is_superadmin || false, adminId],
      );
      this.logger.log(`USER_ROLE_ASSIGNED: user=${userId}, role=${dto.role_id}, by=${adminId}`);
    }

    return this.findOne(userId);
  }

  async removeRole(userId: string, roleId: string, adminId: string): Promise<any> {
    const result = await this.db.query(
      `DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2`,
      [userId, roleId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException(`Role assignment not found`);
    }

    this.logger.log(`USER_ROLE_REMOVED: user=${userId}, role=${roleId}, by=${adminId}`);

    return this.findOne(userId);
  }

  async getRoles(): Promise<any[]> {
    const result = await this.db.query(
      `SELECT id, name, description FROM roles WHERE deleted_at IS NULL ORDER BY name`,
    );
    return result.rows;
  }

  // --- Account Management ---

  async unlockAccount(userId: string, adminId: string): Promise<any> {
    const result = await this.db.query(
      `UPDATE users SET failed_login_attempts = 0, account_locked_until = NULL, updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, email, failed_login_attempts, account_locked_until`,
      [userId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    this.logger.log(`USER_ACCOUNT_UNLOCKED: id=${userId}, by=${adminId}`);

    return result.rows[0];
  }

  async resetPassword(userId: string, newPassword: string, adminId: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    const result = await this.db.query(
      `UPDATE users SET password_hash = $1, last_password_change_at = NOW(),
       failed_login_attempts = 0, account_locked_until = NULL, updated_at = NOW()
       WHERE id = $2 AND deleted_at IS NULL`,
      [passwordHash, userId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    this.logger.log(`USER_PASSWORD_RESET: id=${userId}, by=${adminId}`);
  }
}
