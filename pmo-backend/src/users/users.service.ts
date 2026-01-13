import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  last_login_at: Date | null;
  created_at: Date;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  async findAll(page = 1, limit = 20): Promise<{ users: User[]; total: number }> {
    const offset = (page - 1) * limit;

    const countResult = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL`,
    );

    const result = await this.db.query<User>(
      `SELECT id, email, first_name, last_name, phone, avatar_url,
              is_active, last_login_at, created_at
       FROM users
       WHERE deleted_at IS NULL
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    return {
      users: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  async findById(id: string): Promise<User & { roles: { id: string; name: string }[] }> {
    const result = await this.db.query<User>(
      `SELECT id, email, first_name, last_name, phone, avatar_url,
              is_active, last_login_at, created_at
       FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('User not found');
    }

    const rolesResult = await this.db.query<{ id: string; name: string }>(
      `SELECT r.id, r.name FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = $1`,
      [id],
    );

    return {
      ...result.rows[0],
      roles: rolesResult.rows,
    };
  }

  async create(dto: CreateUserDto, createdBy: string): Promise<User> {
    // Check email uniqueness
    const existingUser = await this.db.query(
      `SELECT id FROM users WHERE email = $1`,
      [dto.email],
    );

    if (existingUser.rows.length > 0) {
      throw new ConflictException('Email already exists');
    }

    const hashRounds = this.configService.get<number>('PASSWORD_HASH_ROUNDS', 10);
    const passwordHash = await bcrypt.hash(dto.password, hashRounds);

    const result = await this.db.query<User>(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, phone, avatar_url, is_active, last_login_at, created_at`,
      [dto.email, passwordHash, dto.first_name, dto.last_name, dto.phone || null],
    );

    this.logger.log(`USER_CREATED: user_id=${result.rows[0].id}, created_by=${createdBy}`);
    return result.rows[0];
  }

  async update(id: string, dto: UpdateUserDto, updatedBy: string): Promise<User> {
    const user = await this.findById(id);

    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (dto.first_name !== undefined) {
      fields.push(`first_name = $${paramIndex++}`);
      values.push(dto.first_name);
    }
    if (dto.last_name !== undefined) {
      fields.push(`last_name = $${paramIndex++}`);
      values.push(dto.last_name);
    }
    if (dto.phone !== undefined) {
      fields.push(`phone = $${paramIndex++}`);
      values.push(dto.phone);
    }

    if (fields.length === 0) {
      return user;
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await this.db.query<User>(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, email, first_name, last_name, phone, avatar_url, is_active, last_login_at, created_at`,
      values,
    );

    this.logger.log(`USER_UPDATED: user_id=${id}, updated_by=${updatedBy}, fields=${Object.keys(dto).join(',')}`);
    return result.rows[0];
  }

  async toggleStatus(id: string, updatedBy: string): Promise<User> {
    await this.findById(id);

    const result = await this.db.query<User>(
      `UPDATE users SET is_active = NOT is_active, updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, first_name, last_name, phone, avatar_url, is_active, last_login_at, created_at`,
      [id],
    );

    const action = result.rows[0].is_active ? 'ACTIVATED' : 'DEACTIVATED';
    this.logger.log(`USER_${action}: user_id=${id}, by=${updatedBy}`);
    return result.rows[0];
  }

  async unlock(id: string, unlockedBy: string): Promise<User> {
    await this.findById(id);

    const result = await this.db.query<User>(
      `UPDATE users SET account_locked_until = NULL, failed_login_attempts = 0, updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, first_name, last_name, phone, avatar_url, is_active, last_login_at, created_at`,
      [id],
    );

    this.logger.log(`ACCOUNT_UNLOCKED: user_id=${id}, unlocked_by=${unlockedBy}`);
    return result.rows[0];
  }

  async softDelete(id: string, deletedBy: string): Promise<void> {
    await this.findById(id);

    await this.db.query(
      `UPDATE users SET deleted_at = NOW(), deleted_by = $2, is_active = FALSE WHERE id = $1`,
      [id, deletedBy],
    );

    this.logger.log(`USER_DELETED: user_id=${id}, deleted_by=${deletedBy}`);
  }

  async getRoles(): Promise<{ id: string; name: string; description: string | null }[]> {
    const result = await this.db.query<{ id: string; name: string; description: string | null }>(
      `SELECT id, name, description FROM roles WHERE deleted_at IS NULL ORDER BY name`,
    );
    return result.rows;
  }

  async assignRole(userId: string, roleId: string, assignedBy: string): Promise<void> {
    await this.findById(userId);

    // Check if role exists
    const roleCheck = await this.db.query(`SELECT id FROM roles WHERE id = $1`, [roleId]);
    if (roleCheck.rows.length === 0) {
      throw new NotFoundException('Role not found');
    }

    // Check if already assigned
    const existing = await this.db.query(
      `SELECT 1 FROM user_roles WHERE user_id = $1 AND role_id = $2`,
      [userId, roleId],
    );

    if (existing.rows.length > 0) {
      throw new ConflictException('Role already assigned');
    }

    await this.db.query(
      `INSERT INTO user_roles (user_id, role_id, assigned_by, created_by)
       VALUES ($1, $2, $3, $3)`,
      [userId, roleId, assignedBy],
    );

    this.logger.log(`ROLE_ASSIGNED: user_id=${userId}, role_id=${roleId}, assigned_by=${assignedBy}`);
  }

  async removeRole(userId: string, roleId: string, removedBy: string): Promise<void> {
    const result = await this.db.query(
      `DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2`,
      [userId, roleId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('Role assignment not found');
    }

    this.logger.log(`ROLE_REMOVED: user_id=${userId}, role_id=${roleId}, removed_by=${removedBy}`);
  }
}
