import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';
import { createPaginatedResponse, PaginatedResponse } from '../common/dto';
import { CreateUserDto, UpdateUserDto, QueryUserDto, AssignRoleDto, SetPermissionOverrideDto, PermissionOverride, BulkPermissionUpdateDto, BulkPermissionResult, BulkCrossUserAccessDto, BulkCrossUserResult } from './dto';
import { JwtPayload } from '../common/interfaces';

// Rank hierarchy constants (lower = higher authority)
export const RANK_LEVELS = {
  SUPER_ADMIN: 10,
  SENIOR_ADMIN: 20,
  MODULE_ADMIN: 30,
  SENIOR_STAFF: 50,
  JUNIOR_STAFF: 70,
  VIEWER: 100,
} as const;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly SALT_ROUNDS = 12;
  private readonly ALLOWED_SORTS = ['created_at', 'email', 'first_name', 'last_name', 'is_active', 'rank_level'];

  constructor(private readonly db: DatabaseService) {}

  /**
   * Get actor's rank level and superadmin status
   */
  private async getActorRank(actorId: string): Promise<{ rank_level: number; is_superadmin: boolean }> {
    const result = await this.db.query(
      `SELECT u.rank_level, COALESCE(
         (SELECT TRUE FROM user_roles ur WHERE ur.user_id = u.id AND ur.is_superadmin = TRUE LIMIT 1),
         FALSE
       ) as is_superadmin
       FROM users u
       WHERE u.id = $1 AND u.deleted_at IS NULL`,
      [actorId],
    );
    if (result.rows.length === 0) {
      return { rank_level: RANK_LEVELS.VIEWER, is_superadmin: false };
    }
    return {
      rank_level: result.rows[0].rank_level || RANK_LEVELS.VIEWER,
      is_superadmin: result.rows[0].is_superadmin,
    };
  }

  /**
   * Check if actor can modify target user based on rank hierarchy
   * SuperAdmin can modify anyone, others can only modify users with lower authority (higher rank_level)
   */
  private async canModifyUser(actorId: string, targetId: string): Promise<boolean> {
    // Use the PostgreSQL function we created in migration
    const result = await this.db.query(
      `SELECT can_modify_user($1, $2) as can_modify`,
      [actorId, targetId],
    );
    return result.rows[0]?.can_modify === true;
  }

  /**
   * Validate that actor can assign the given rank level
   * Actor can only assign ranks lower than their own (higher rank_level number)
   */
  private async validateRankAssignment(actorId: string, targetRank: number): Promise<void> {
    const actor = await this.getActorRank(actorId);

    // SuperAdmin can assign any rank
    if (actor.is_superadmin) return;

    // Non-SuperAdmin can only assign ranks lower than their own
    if (targetRank <= actor.rank_level) {
      throw new ForbiddenException(
        `Cannot assign rank ${targetRank}. You can only assign ranks lower than your own (>${actor.rank_level}).`,
      );
    }
  }

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

    if (query.campus) {
      conditions.push(`u.campus = $${paramIndex++}`);
      params.push(query.campus);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query(
      `SELECT COUNT(*) FROM users u WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await this.db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.avatar_url,
              u.is_active, u.last_login_at, u.rank_level, u.campus, u.created_at, u.updated_at,
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

  /**
   * Map record campus value (MAIN/CABADBARAN/BOTH) to user campus value (Butuan Campus/Cabadbaran).
   * Phase AM: Resolves taxonomy mismatch between record and user campus fields.
   * Returns null when no campus filter should be applied (BOTH, null, or unmapped value).
   */
  private normalizeRecordCampusToUserCampus(recordCampus?: string): string | null {
    if (!recordCampus || recordCampus === 'BOTH') return null;
    if (recordCampus === 'MAIN') return 'Butuan Campus';
    if (recordCampus === 'CABADBARAN') return 'Cabadbaran';
    return null;
  }

  /**
   * Find users eligible for record assignment.
   * Phase AL: Replaces INNER JOIN on user_module_assignments with role-based filter.
   * Phase AV: REMOVED campus filtering — global searchable assignment across all campuses.
   *           Assignment does NOT grant module access; visibility enforced by backend rules.
   * Eligible = active, non-deleted users with role Staff, Admin, or SuperAdmin.
   */
  async findEligibleForAssignment(): Promise<any[]> {
    const result = await this.db.query(
      `SELECT u.id, u.first_name, u.last_name, u.campus
       FROM users u
       WHERE u.deleted_at IS NULL
         AND u.is_active = true
         AND EXISTS (
           SELECT 1 FROM user_roles ur
           JOIN roles r ON ur.role_id = r.id
           WHERE ur.user_id = u.id
             AND r.name IN ('Staff', 'Admin', 'SuperAdmin')
         )
       ORDER BY u.last_name, u.first_name`,
      [],
    );

    return result.rows;
  }

  async findOne(id: string): Promise<any> {
    const result = await this.db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.avatar_url,
              u.is_active, u.last_login_at, u.failed_login_attempts,
              u.account_locked_until, u.rank_level, u.campus, u.metadata, u.created_at, u.updated_at
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
    const existingEmail = await this.db.query(
      `SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL`,
      [dto.email],
    );

    if (existingEmail.rows.length > 0) {
      throw new ConflictException(`User with email ${dto.email} already exists`);
    }

    // Check for duplicate username
    const existingUsername = await this.db.query(
      `SELECT id FROM users WHERE LOWER(username) = LOWER($1) AND deleted_at IS NULL`,
      [dto.username],
    );

    if (existingUsername.rows.length > 0) {
      throw new ConflictException(`User with username ${dto.username} already exists`);
    }

    // Rank-Based Permission: Validate rank assignment
    const targetRank = dto.rank_level !== undefined ? dto.rank_level : RANK_LEVELS.VIEWER;
    await this.validateRankAssignment(adminId, targetRank);

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    const result = await this.db.query(
      `INSERT INTO users (email, username, password_hash, first_name, last_name, phone, avatar_url, is_active, rank_level, campus, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, email, username, first_name, last_name, phone, avatar_url, is_active, rank_level, campus, created_at`,
      [
        dto.email,
        dto.username.toLowerCase(),
        passwordHash,
        dto.first_name,
        dto.last_name,
        dto.phone || null,
        dto.avatar_url || null,
        dto.is_active !== undefined ? dto.is_active : true,
        targetRank,
        dto.campus || null,  // Phase Y: Office-scoped visibility
        dto.metadata ? JSON.stringify(dto.metadata) : null,
      ],
    );

    this.logger.log(`USER_CREATED: id=${result.rows[0].id}, email=${dto.email}, rank=${targetRank}, by=${adminId}`);

    return result.rows[0];
  }

  async update(id: string, dto: UpdateUserDto, adminId: string): Promise<any> {
    // Verify user exists (Phase BY: Fetch username and email for audit logging)
    const existing = await this.db.query(
      `SELECT id, rank_level, username, email FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );

    if (existing.rows.length === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Phase CE: Field-level permission for self-edit vs admin edit
    if (id === adminId) {
      // Self-edit allowed ONLY for basic info fields
      const allowedSelfEditFields = ['first_name', 'last_name', 'phone', 'avatar_url'];
      const forbiddenFields: string[] = [];

      // Check each field in dto for forbidden self-edits
      if (dto.username !== undefined) forbiddenFields.push('username');
      if (dto.email !== undefined) forbiddenFields.push('email');
      if (dto.password !== undefined) forbiddenFields.push('password');
      if (dto.rank_level !== undefined) forbiddenFields.push('rank_level');
      if (dto.is_active !== undefined) forbiddenFields.push('is_active');
      if (dto.metadata !== undefined) forbiddenFields.push('metadata');
      if ((dto as any).campus !== undefined) forbiddenFields.push('campus');

      if (forbiddenFields.length > 0) {
        throw new ForbiddenException(
          `Cannot self-edit: ${forbiddenFields.join(', ')}. Admin approval required for username, email, rank, or password changes.`
        );
      }
      // Self-edit for basic info — skip rank check
    } else {
      // Admin editing another user — enforce rank check
      const canModify = await this.canModifyUser(adminId, id);
      if (!canModify) {
        throw new ForbiddenException('Cannot modify a user with equal or higher authority');
      }
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
    // Phase BY: Username update with uniqueness validation
    if (dto.username !== undefined) {
      // Check uniqueness
      const usernameCheck = await this.db.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2 AND deleted_at IS NULL',
        [dto.username, id],
      );
      if (usernameCheck.rowCount > 0) {
        throw new ConflictException('Username already exists');
      }

      updates.push(`username = $${paramIndex++}`);
      values.push(dto.username);

      this.logger.log({
        action: 'USER_USERNAME_CHANGED',
        userId: id,
        oldValue: existing.rows[0].username,
        newValue: dto.username,
        actorId: adminId,
        timestamp: new Date().toISOString(),
      });
    }
    // Phase BZ: Email update with uniqueness validation
    if (dto.email !== undefined) {
      // Check uniqueness
      const emailCheck = await this.db.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2 AND deleted_at IS NULL',
        [dto.email, id],
      );
      if (emailCheck.rowCount > 0) {
        throw new ConflictException('Email already exists');
      }

      updates.push(`email = $${paramIndex++}`);
      values.push(dto.email);

      this.logger.log({
        action: 'USER_EMAIL_CHANGED',
        userId: id,
        oldValue: existing.rows[0].email,
        newValue: dto.email,
        actorId: adminId,
        timestamp: new Date().toISOString(),
      });
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

    // Rank update with validation
    if (dto.rank_level !== undefined) {
      await this.validateRankAssignment(adminId, dto.rank_level);
      updates.push(`rank_level = $${paramIndex++}`);
      values.push(dto.rank_level);
    }

    // Phase Y: Campus update for office-scoped visibility
    if ((dto as any).campus !== undefined) {
      updates.push(`campus = $${paramIndex++}`);
      values.push((dto as any).campus);
    }

    if (updates.length === 0) {
      return this.findOne(id);
    }

    updates.push(`updated_at = NOW()`);

    const result = await this.db.query(
      `UPDATE users SET ${updates.join(', ')}
       WHERE id = $${paramIndex} AND deleted_at IS NULL
       RETURNING id, email, first_name, last_name, phone, avatar_url, is_active, rank_level, campus, updated_at`,
      [...values, id],
    );

    this.logger.log(`USER_UPDATED: id=${id}, by=${adminId}`);

    return result.rows[0];
  }

  async remove(id: string, adminId: string): Promise<void> {
    // Rank-Based Permission: Check if actor can modify this user
    const canModify = await this.canModifyUser(adminId, id);
    if (!canModify) {
      throw new ForbiddenException('Cannot delete a user with equal or higher authority');
    }

    // Prevent self-deletion
    if (id === adminId) {
      throw new ForbiddenException('Cannot delete your own account');
    }

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

    // Rank-Based Permission: Check if actor can modify this user
    if (userId !== adminId) {
      const canModify = await this.canModifyUser(adminId, userId);
      if (!canModify) {
        throw new ForbiddenException('Cannot modify roles of a user with equal or higher authority');
      }
    }

    // Verify role exists
    const roleExists = await this.db.query(
      `SELECT id, name FROM roles WHERE id = $1 AND deleted_at IS NULL`,
      [dto.role_id],
    );
    if (roleExists.rows.length === 0) {
      throw new NotFoundException(`Role with ID ${dto.role_id} not found`);
    }

    // SuperAdmin governance: Prevent self-assignment
    if (dto.is_superadmin === true && userId === adminId) {
      throw new BadRequestException('Cannot assign SuperAdmin status to yourself');
    }

    // SuperAdmin governance: Only existing SuperAdmin can assign SuperAdmin
    if (dto.is_superadmin === true) {
      const adminIsSuperAdmin = await this.db.query(
        `SELECT 1 FROM user_roles WHERE user_id = $1 AND is_superadmin = TRUE`,
        [adminId],
      );
      if (adminIsSuperAdmin.rows.length === 0) {
        throw new BadRequestException('Only a SuperAdmin can assign SuperAdmin status');
      }
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
      this.logger.log(`USER_ROLE_UPDATED: user=${userId}, role=${dto.role_id}, superadmin=${dto.is_superadmin}, by=${adminId}`);
    } else {
      await this.db.query(
        `INSERT INTO user_roles (user_id, role_id, is_superadmin, assigned_by, created_by)
         VALUES ($1, $2, $3, $4, $4)`,
        [userId, dto.role_id, dto.is_superadmin || false, adminId],
      );
      this.logger.log(`USER_ROLE_ASSIGNED: user=${userId}, role=${dto.role_id}, superadmin=${dto.is_superadmin}, by=${adminId}`);
    }

    return this.findOne(userId);
  }

  async removeRole(userId: string, roleId: string, adminId: string): Promise<any> {
    // Rank-Based Permission: Check if actor can modify this user
    if (userId !== adminId) {
      const canModify = await this.canModifyUser(adminId, userId);
      if (!canModify) {
        throw new ForbiddenException('Cannot modify roles of a user with equal or higher authority');
      }
    }

    // Check if this is a SuperAdmin role being removed
    const targetRole = await this.db.query(
      `SELECT is_superadmin FROM user_roles WHERE user_id = $1 AND role_id = $2`,
      [userId, roleId],
    );

    if (targetRole.rows.length === 0) {
      throw new NotFoundException(`Role assignment not found`);
    }

    // SuperAdmin governance: Prevent removal of last SuperAdmin
    if (targetRole.rows[0].is_superadmin) {
      const superAdminCount = await this.db.query(
        `SELECT COUNT(*) FROM user_roles WHERE is_superadmin = TRUE`,
      );
      if (parseInt(superAdminCount.rows[0].count, 10) <= 1) {
        throw new BadRequestException('Cannot remove the last SuperAdmin. Assign another SuperAdmin first.');
      }
    }

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
    // Phase CD: Prevent self-reset (SuperAdmin cannot bypass complexity for self)
    if (userId === adminId) {
      throw new ForbiddenException(
        'Cannot bypass password complexity for your own account. Use profile settings to change your password with complexity requirements.'
      );
    }

    // Phase CD: Check if actor can modify target user (rank-based permission)
    const canModify = await this.canModifyUser(adminId, userId);
    if (!canModify) {
      throw new ForbiddenException('Cannot reset password for a user with equal or higher authority');
    }

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

    // Phase CD: Enhanced structured audit logging
    this.logger.log({
      action: 'USER_PASSWORD_RESET',
      userId: userId,
      actorId: adminId,
      bypass_complexity: true,
      timestamp: new Date().toISOString(),
    });
  }

  // --- Permission Overrides ---

  async getPermissionOverrides(userId: string): Promise<PermissionOverride[]> {
    const result = await this.db.query<PermissionOverride>(
      `SELECT id, user_id, module_key, can_access, created_at, updated_at
       FROM user_permission_overrides
       WHERE user_id = $1
       ORDER BY module_key ASC`,
      [userId],
    );
    return result.rows;
  }

  async setPermissionOverride(
    userId: string,
    dto: SetPermissionOverrideDto,
    adminId: string,
  ): Promise<PermissionOverride> {
    // Verify user exists
    const userCheck = await this.db.query(
      'SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL',
      [userId],
    );
    if (userCheck.rowCount === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Rank-Based Permission: Check if actor can modify this user
    if (userId !== adminId) {
      const canModify = await this.canModifyUser(adminId, userId);
      if (!canModify) {
        throw new ForbiddenException('Cannot modify permissions of a user with equal or higher authority');
      }
    }

    // Upsert permission override
    const result = await this.db.query<PermissionOverride>(
      `INSERT INTO user_permission_overrides (user_id, module_key, can_access, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $4)
       ON CONFLICT (user_id, module_key)
       DO UPDATE SET can_access = $3, updated_by = $4, updated_at = NOW()
       RETURNING *`,
      [userId, dto.module_key, dto.can_access, adminId],
    );

    this.logger.log(`PERMISSION_OVERRIDE_SET: user=${userId}, module=${dto.module_key}, access=${dto.can_access}, by=${adminId}`);
    return result.rows[0];
  }

  async removePermissionOverride(
    userId: string,
    moduleKey: string,
    adminId: string,
  ): Promise<void> {
    // Rank-Based Permission: Check if actor can modify this user
    if (userId !== adminId) {
      const canModify = await this.canModifyUser(adminId, userId);
      if (!canModify) {
        throw new ForbiddenException('Cannot modify permissions of a user with equal or higher authority');
      }
    }

    const result = await this.db.query(
      'DELETE FROM user_permission_overrides WHERE user_id = $1 AND module_key = $2',
      [userId, moduleKey],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException(`Permission override not found for user ${userId} and module ${moduleKey}`);
    }

    this.logger.log(`PERMISSION_OVERRIDE_REMOVED: user=${userId}, module=${moduleKey}, by=${adminId}`);
  }

  /**
   * Bulk update permission overrides in a single transaction
   * This prevents ThrottlerException by reducing N requests to 1
   */
  async bulkUpdatePermissions(
    userId: string,
    dto: BulkPermissionUpdateDto,
    adminId: string,
  ): Promise<BulkPermissionResult> {
    // Verify user exists
    const userCheck = await this.db.query(
      'SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL',
      [userId],
    );
    if (userCheck.rowCount === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Rank-Based Permission: Check if actor can modify this user
    if (userId !== adminId) {
      const canModify = await this.canModifyUser(adminId, userId);
      if (!canModify) {
        throw new ForbiddenException('Cannot modify permissions of a user with equal or higher authority');
      }
    }

    // Validate updates array is not empty
    if (!dto.updates || dto.updates.length === 0) {
      throw new BadRequestException('Updates array cannot be empty');
    }

    // SAFETY CHECK 1: Prevent self-access revocation for 'users' module
    // Admin should not be able to lock themselves out of User Management
    const isRevokingOwnUsersAccess = userId === adminId &&
      dto.updates.some(u => u.module_key === 'users' && u.can_access === false);
    if (isRevokingOwnUsersAccess) {
      throw new ForbiddenException('Cannot revoke your own access to User Management');
    }

    // SAFETY CHECK 2: Prevent removing last admin from Users module
    const isRevokingUsersAccess = dto.updates.some(u => u.module_key === 'users' && u.can_access === false);
    if (isRevokingUsersAccess) {
      // Count how many users currently have access to Users module (via role or override)
      const adminsWithAccessResult = await this.db.query(
        `SELECT COUNT(DISTINCT u.id) as count
         FROM users u
         JOIN user_roles ur ON u.id = ur.user_id
         JOIN roles r ON ur.role_id = r.id
         WHERE u.deleted_at IS NULL
           AND u.is_active = TRUE
           AND u.id != $1
           AND (r.name = 'Admin' OR ur.is_superadmin = TRUE)`,
        [userId],
      );
      const remainingAdmins = parseInt(adminsWithAccessResult.rows[0].count, 10);
      if (remainingAdmins === 0) {
        throw new ForbiddenException('Cannot remove the last administrator from User Management');
      }
    }

    let updatedCount = 0;
    let deletedCount = 0;

    // Use transaction for atomicity
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');

      for (const update of dto.updates) {
        if (update.can_access === null) {
          // Delete override (reset to role default)
          const deleteResult = await client.query(
            'DELETE FROM user_permission_overrides WHERE user_id = $1 AND module_key = $2',
            [userId, update.module_key],
          );
          if (deleteResult.rowCount && deleteResult.rowCount > 0) {
            deletedCount++;
          }
        } else {
          // Upsert override (grant or revoke)
          await client.query(
            `INSERT INTO user_permission_overrides (user_id, module_key, can_access, created_by, updated_by)
             VALUES ($1, $2, $3, $4, $4)
             ON CONFLICT (user_id, module_key)
             DO UPDATE SET can_access = $3, updated_by = $4, updated_at = NOW()`,
            [userId, update.module_key, update.can_access, adminId],
          );
          updatedCount++;
        }
      }

      await client.query('COMMIT');

      this.logger.log(
        `BULK_PERMISSION_UPDATE: user=${userId}, updated=${updatedCount}, deleted=${deletedCount}, by=${adminId}`,
      );

      return {
        success: true,
        updated: updatedCount,
        deleted: deletedCount,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      this.logger.error(`BULK_PERMISSION_UPDATE_FAILED: user=${userId}, error=${err.message}`);
      throw err;
    } finally {
      client.release();
    }
  }

  // ============================================================
  // MODULE ASSIGNMENT MANAGEMENT
  // ============================================================

  /**
   * Get user's module assignments
   */
  async getModuleAssignments(userId: string): Promise<any[]> {
    const user = await this.db.query(
      `SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [userId],
    );
    if (user.rows.length === 0) {
      throw new NotFoundException('User not found');
    }

    const result = await this.db.query(
      `SELECT uma.id, uma.user_id, uma.module, uma.assigned_by, uma.assigned_at,
              u.email as assigned_by_email
       FROM user_module_assignments uma
       LEFT JOIN users u ON uma.assigned_by = u.id
       WHERE uma.user_id = $1
       ORDER BY uma.module`,
      [userId],
    );

    return result.rows;
  }

  /**
   * Assign a module to a user
   */
  async assignModule(userId: string, module: string, adminId: string): Promise<any> {
    // Validate user exists
    const user = await this.db.query(
      `SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [userId],
    );
    if (user.rows.length === 0) {
      throw new NotFoundException('User not found');
    }

    // Validate module type
    const validModules = ['CONSTRUCTION', 'REPAIR', 'OPERATIONS', 'ALL'];
    if (!validModules.includes(module)) {
      throw new BadRequestException(`Invalid module type: ${module}`);
    }

    // Check if assignment already exists
    const existing = await this.db.query(
      `SELECT id FROM user_module_assignments WHERE user_id = $1 AND module = $2`,
      [userId, module],
    );
    if (existing.rows.length > 0) {
      throw new ConflictException(`User already has ${module} module assigned`);
    }

    // If assigning ALL, remove individual module assignments (they're redundant)
    if (module === 'ALL') {
      await this.db.query(
        `DELETE FROM user_module_assignments WHERE user_id = $1 AND module != 'ALL'`,
        [userId],
      );
    }

    // If assigning individual module and user has ALL, skip (ALL already covers it)
    if (module !== 'ALL') {
      const hasAll = await this.db.query(
        `SELECT id FROM user_module_assignments WHERE user_id = $1 AND module = 'ALL'`,
        [userId],
      );
      if (hasAll.rows.length > 0) {
        throw new ConflictException('User already has ALL modules assigned');
      }
    }

    // Create assignment
    const result = await this.db.query(
      `INSERT INTO user_module_assignments (user_id, module, assigned_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, module, adminId],
    );

    this.logger.log(`MODULE_ASSIGN: user=${userId}, module=${module}, by=${adminId}`);

    return result.rows[0];
  }

  /**
   * Remove a module assignment from a user
   */
  async removeModuleAssignment(userId: string, module: string, adminId: string): Promise<void> {
    // Validate user exists
    const user = await this.db.query(
      `SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [userId],
    );
    if (user.rows.length === 0) {
      throw new NotFoundException('User not found');
    }

    // Delete assignment
    const result = await this.db.query(
      `DELETE FROM user_module_assignments WHERE user_id = $1 AND module = $2`,
      [userId, module],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException(`Module assignment not found: ${module}`);
    }

    this.logger.log(`MODULE_UNASSIGN: user=${userId}, module=${module}, by=${adminId}`);
  }

  /**
   * Bulk update module assignments (replaces all existing assignments)
   */
  async bulkUpdateModuleAssignments(
    userId: string,
    modules: string[],
    adminId: string,
  ): Promise<{ success: boolean; assigned: string[] }> {
    // Validate user exists
    const user = await this.db.query(
      `SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [userId],
    );
    if (user.rows.length === 0) {
      throw new NotFoundException('User not found');
    }

    // Validate all modules
    const validModules = ['CONSTRUCTION', 'REPAIR', 'OPERATIONS', 'ALL'];
    for (const module of modules) {
      if (!validModules.includes(module)) {
        throw new BadRequestException(`Invalid module type: ${module}`);
      }
    }

    // If ALL is in the list, only keep ALL
    const finalModules = modules.includes('ALL') ? ['ALL'] : modules;

    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');

      // Delete all existing assignments
      await client.query(
        `DELETE FROM user_module_assignments WHERE user_id = $1`,
        [userId],
      );

      // Insert new assignments
      for (const module of finalModules) {
        await client.query(
          `INSERT INTO user_module_assignments (user_id, module, assigned_by)
           VALUES ($1, $2, $3)`,
          [userId, module, adminId],
        );
      }

      await client.query('COMMIT');

      this.logger.log(
        `BULK_MODULE_UPDATE: user=${userId}, modules=[${finalModules.join(',')}], by=${adminId}`,
      );

      return {
        success: true,
        assigned: finalModules,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      this.logger.error(`BULK_MODULE_UPDATE_FAILED: user=${userId}, error=${err.message}`);
      throw err;
    } finally {
      client.release();
    }
  }

  // --- Pillar Assignments (Phase HN, Directive 156) ---

  async getPillarAssignments(userId: string): Promise<string[]> {
    const result = await this.db.query(
      `SELECT pillar_type FROM user_pillar_assignments WHERE user_id = $1 ORDER BY pillar_type`,
      [userId],
    );
    return result.rows.map(r => r.pillar_type);
  }

  async assignPillar(userId: string, pillarType: string, actorId: string): Promise<{ pillar_type: string }> {
    const valid = ['HIGHER_EDUCATION', 'ADVANCED_EDUCATION', 'RESEARCH', 'TECHNICAL_ADVISORY'];
    if (!valid.includes(pillarType)) {
      throw new BadRequestException(`Invalid pillar_type: ${pillarType}`);
    }
    await this.db.query(
      `INSERT INTO user_pillar_assignments (user_id, pillar_type, assigned_by)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, pillar_type) DO NOTHING`,
      [userId, pillarType, actorId],
    );
    this.logger.log(`PILLAR_ASSIGNED: user=${userId}, pillar=${pillarType}, by=${actorId}`);
    return { pillar_type: pillarType };
  }

  async revokePillar(userId: string, pillarType: string, actorId: string): Promise<void> {
    await this.db.query(
      `DELETE FROM user_pillar_assignments WHERE user_id = $1 AND pillar_type = $2`,
      [userId, pillarType],
    );
    this.logger.log(`PILLAR_REVOKED: user=${userId}, pillar=${pillarType}, by=${actorId}`);
  }

  // --- Password Reset Requests (Phase HQ, Directive 177) ---

  async getPasswordResetRequests(): Promise<any[]> {
    const result = await this.db.query(
      `SELECT id, identifier, status, notes, requested_at, completed_by, completed_at
       FROM password_reset_requests
       WHERE status = 'PENDING'
       ORDER BY requested_at DESC`,
    );
    return result.rows;
  }

  async completePasswordResetRequest(requestId: string, adminId: string): Promise<void> {
    await this.db.query(
      `UPDATE password_reset_requests
       SET status = 'COMPLETED', completed_by = $2, completed_at = NOW()
       WHERE id = $1 AND status = 'PENDING'`,
      [requestId, adminId],
    );
    this.logger.log(`PASSWORD_RESET_COMPLETED: request=${requestId}, by=${adminId}`);
  }

  // --- Phase HV: Cross-User Bulk Access Update (Directive 225) ---

  async bulkCrossUserAccessUpdate(
    dto: BulkCrossUserAccessDto,
    adminId: string,
  ): Promise<BulkCrossUserResult> {
    if (!dto.userIds || dto.userIds.length === 0) {
      throw new BadRequestException('userIds array cannot be empty');
    }
    if (dto.userIds.length > 50) {
      throw new BadRequestException('Cannot update more than 50 users at once');
    }

    const result: BulkCrossUserResult = {
      success: true,
      total: dto.userIds.length,
      applied: 0,
      skipped: 0,
      errors: [],
    };

    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');

      for (const userId of dto.userIds) {
        try {
          // Verify user exists
          const userCheck = await client.query(
            'SELECT id FROM users WHERE id = $1 AND deleted_at IS NULL',
            [userId],
          );
          if (userCheck.rowCount === 0) {
            result.skipped++;
            result.errors.push(`User ${userId}: not found`);
            continue;
          }

          // Rank check — skip users that admin cannot modify
          const canModify = await this.canModifyUser(adminId, userId);
          if (!canModify) {
            result.skipped++;
            result.errors.push(`User ${userId}: insufficient authority`);
            continue;
          }

          if (dto.type === 'permission') {
            // Upsert permission override
            await client.query(
              `INSERT INTO user_permission_overrides (user_id, module_key, can_access, created_by, updated_by)
               VALUES ($1, $2, $3, $4, $4)
               ON CONFLICT (user_id, module_key)
               DO UPDATE SET can_access = $3, updated_by = $4, updated_at = NOW()`,
              [userId, dto.key, dto.action === 'grant', adminId],
            );
            result.applied++;
          } else if (dto.type === 'module') {
            if (dto.action === 'grant') {
              await client.query(
                `INSERT INTO user_module_assignments (user_id, module, assigned_by)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (user_id, module) DO NOTHING`,
                [userId, dto.key, adminId],
              );
            } else {
              await client.query(
                'DELETE FROM user_module_assignments WHERE user_id = $1 AND module = $2',
                [userId, dto.key],
              );
            }
            result.applied++;
          } else if (dto.type === 'pillar') {
            if (dto.action === 'grant') {
              await client.query(
                `INSERT INTO user_pillar_assignments (user_id, pillar_type, assigned_by)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (user_id, pillar_type) DO NOTHING`,
                [userId, dto.key, adminId],
              );
            } else {
              await client.query(
                'DELETE FROM user_pillar_assignments WHERE user_id = $1 AND pillar_type = $2',
                [userId, dto.key],
              );
            }
            result.applied++;
          }
        } catch (err) {
          result.skipped++;
          result.errors.push(`User ${userId}: ${err.message}`);
        }
      }

      await client.query('COMMIT');
      this.logger.log(
        `BULK_CROSS_USER_ACCESS: type=${dto.type}, action=${dto.action}, key=${dto.key}, applied=${result.applied}/${result.total}, by=${adminId}`,
      );
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      this.logger.error(`BULK_CROSS_USER_ACCESS_FAILED: ${err.message}`);
      throw err;
    } finally {
      client.release();
    }
  }
}
