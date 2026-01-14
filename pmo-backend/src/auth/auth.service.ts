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

  async validateUser(email: string, password: string): Promise<any> {
    const result = await this.db.query(
      `SELECT u.id, u.email, u.password_hash, u.is_active, u.google_id,
              u.failed_login_attempts, u.account_locked_until,
              u.first_name, u.last_name
       FROM users u
       WHERE u.email = $1 AND u.deleted_at IS NULL`,
      [email],
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
    const user = await this.validateUser(dto.email, dto.password);

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

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles,
      is_superadmin,
    };

    this.logger.log(`LOGIN_SUCCESS: user_id=${user.id}`);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        roles,
      },
    };
  }

  async getProfile(userId: string) {
    const result = await this.db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.avatar_url
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

    return {
      ...user,
      roles: rolesResult.rows.map((r) => ({ id: r.id, name: r.name })),
      is_superadmin: rolesResult.rows.some((r) => r.is_superadmin),
      permissions: permsResult.rows.map((p) => p.name),
    };
  }
}
