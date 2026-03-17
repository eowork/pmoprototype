import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';
import { JwtPayload } from '../common/interfaces';
import { LoginDto } from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(identifier: string, password: string): Promise<any> {
    // Support login by email or username (case-insensitive)
    // Uses proper username column (indexed) for O(log n) performance
    const result = await this.db.query(
      `SELECT u.id, u.email, u.username, u.password_hash, u.is_active, u.google_id,
              u.failed_login_attempts, u.account_locked_until,
              u.first_name, u.last_name, u.rank_level, u.campus
       FROM users u
       WHERE (LOWER(u.email) = LOWER($1) OR LOWER(u.username) = LOWER($1))
         AND u.deleted_at IS NULL`,
      [identifier],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];

    // Check if account is locked
    if (user.account_locked_until && new Date(user.account_locked_until) > new Date()) {
      this.logger.warn(`LOGIN_FAILURE: user_id=${user.id}, reason=ACCOUNT_LOCKED`);
      return null;
    }

    // Check if account is active
    if (!user.is_active) {
      this.logger.warn(`LOGIN_FAILURE: user_id=${user.id}, reason=ACCOUNT_INACTIVE`);
      return null;
    }

    // SSO-only account sentinel
    if (user.google_id && (!user.password_hash || user.password_hash === '')) {
      this.logger.warn(`LOGIN_FAILURE: user_id=${user.id}, reason=SSO_ONLY_ACCOUNT`);
      return null;
    }

    // Validate password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      // Increment failed attempts
      await this.db.query(
        `UPDATE users SET failed_login_attempts = COALESCE(failed_login_attempts, 0) + 1,
         account_locked_until = CASE
           WHEN COALESCE(failed_login_attempts, 0) >= 4 THEN NOW() + INTERVAL '15 minutes'
           ELSE account_locked_until
         END
         WHERE id = $1`,
        [user.id],
      );
      this.logger.warn(`LOGIN_FAILURE: user_id=${user.id}, reason=INVALID_PASSWORD`);
      return null;
    }

    // Reset failed attempts on success
    await this.db.query(
      `UPDATE users SET failed_login_attempts = 0, account_locked_until = NULL WHERE id = $1`,
      [user.id],
    );

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.identifier, dto.password);

    if (!user) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    // Get user roles
    const rolesResult = await this.db.query(
      `SELECT r.name, ur.is_superadmin
       FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = $1`,
      [user.id],
    );

    const roles = rolesResult.rows.map((r) => r.name);
    const is_superadmin = rolesResult.rows.some((r) => r.is_superadmin);

    // Get permissions for the user (via role_permissions)
    const permsResult = await this.db.query(
      `SELECT DISTINCT p.name
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       JOIN user_roles ur ON rp.role_id = ur.role_id
       WHERE ur.user_id = $1`,
      [user.id],
    );
    const permissions = permsResult.rows.map((p) => p.name);

    // Get module permission overrides for sidebar filtering
    const overridesResult = await this.db.query(
      `SELECT module_key, can_access
       FROM user_permission_overrides
       WHERE user_id = $1`,
      [user.id],
    );
    const module_overrides = overridesResult.rows.reduce((acc, row) => {
      acc[row.module_key] = row.can_access;
      return acc;
    }, {} as Record<string, boolean>);

    // Get module assignments for approval visibility
    const moduleAssignmentsResult = await this.db.query(
      `SELECT module FROM user_module_assignments WHERE user_id = $1`,
      [user.id],
    );
    const module_assignments = moduleAssignmentsResult.rows.map((row) => row.module);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles,
      is_superadmin,
      campus: user.campus || undefined,  // Phase Y: Office-scoped visibility
    };

    this.logger.log(`LOGIN_SUCCESS: user_id=${user.id}, superadmin=${is_superadmin}`);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        roles,
        is_superadmin,
        permissions,
        module_overrides,
        module_assignments,
        rank_level: user.rank_level,
        campus: user.campus,  // Phase Y: Office-scoped visibility
        role: roles.length > 0 ? { name: roles[0] } : undefined,
      },
    };
  }

  async getProfile(userId: string) {
    const result = await this.db.query(
      `SELECT u.id, u.email, u.username, u.first_name, u.last_name, u.avatar_url, u.rank_level, u.campus
       FROM users u
       WHERE u.id = $1 AND u.deleted_at IS NULL`,
      [userId],
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedException('User not found');
    }

    const user = result.rows[0];

    // Get roles
    const rolesResult = await this.db.query(
      `SELECT r.id, r.name, ur.is_superadmin
       FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = $1`,
      [userId],
    );

    // Get permissions
    const permsResult = await this.db.query(
      `SELECT DISTINCT p.name
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       JOIN user_roles ur ON rp.role_id = ur.role_id
       WHERE ur.user_id = $1`,
      [userId],
    );

    // Get module permission overrides for sidebar filtering
    const overridesResult = await this.db.query(
      `SELECT module_key, can_access
       FROM user_permission_overrides
       WHERE user_id = $1`,
      [userId],
    );
    const module_overrides = overridesResult.rows.reduce((acc, row) => {
      acc[row.module_key] = row.can_access;
      return acc;
    }, {} as Record<string, boolean>);

    // Get module assignments for approval visibility
    const moduleAssignmentsResult = await this.db.query(
      `SELECT module FROM user_module_assignments WHERE user_id = $1`,
      [userId],
    );
    const module_assignments = moduleAssignmentsResult.rows.map((row) => row.module);

    // Phase CF: Extract roles for reuse in role field
    const roles = rolesResult.rows.map((r) => ({ id: r.id, name: r.name }));

    return {
      ...user,
      roles,
      is_superadmin: rolesResult.rows.some((r) => r.is_superadmin),
      permissions: permsResult.rows.map((p) => p.name),
      module_overrides,
      module_assignments,
      rank_level: user.rank_level,
      campus: user.campus,  // Phase Y: Office-scoped visibility
      // Phase CF: Add role field to match login() response format for frontend adapter
      role: roles.length > 0 ? { name: roles[0].name } : undefined,
    };
  }

  async logout(userId: string): Promise<void> {
    this.logger.log(`LOGOUT: user_id=${userId}`);
  }
}
