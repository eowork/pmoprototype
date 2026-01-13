import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';
import { LoginDto } from './dto/login.dto';
import { GoogleProfile } from './strategies/google.strategy';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  roles: string[];
  isSuperAdmin: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  roles: { id: string; name: string }[];
  is_superadmin: boolean;
  permissions: string[];
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<{ access_token: string; user: Partial<UserProfile> }> {
    const { email, password } = dto;

    // Find user by email (include google_id to check SSO-only accounts)
    const userResult = await this.db.query<{
      id: string;
      email: string;
      password_hash: string;
      first_name: string;
      last_name: string;
      is_active: boolean;
      account_locked_until: Date | null;
      failed_login_attempts: number;
      google_id: string | null;
    }>(
      `SELECT id, email, password_hash, first_name, last_name,
              is_active, account_locked_until, failed_login_attempts, google_id
       FROM users WHERE email = $1 AND deleted_at IS NULL`,
      [email],
    );

    // Generic error for user not found (no info leakage)
    if (userResult.rows.length === 0) {
      this.logger.warn(`LOGIN_FAILURE: reason=INVALID_CREDENTIALS`);
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    const user = userResult.rows[0];

    // Google-only account sentinel: block password login if no password set
    if (user.google_id && (!user.password_hash || user.password_hash === '')) {
      this.logger.warn(`LOGIN_FAILURE: user_id=${user.id}, reason=SSO_ONLY_ACCOUNT`);
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    // Check if account is locked (generic error)
    if (user.account_locked_until && new Date(user.account_locked_until) > new Date()) {
      this.logger.warn(`LOGIN_FAILURE: user_id=${user.id}, reason=ACCOUNT_LOCKED`);
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    // Check if account is active (generic error)
    if (!user.is_active) {
      this.logger.warn(`LOGIN_FAILURE: user_id=${user.id}, reason=ACCOUNT_INACTIVE`);
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      // Increment failed attempts
      await this.incrementFailedAttempts(user.id, user.failed_login_attempts);
      this.logger.warn(`LOGIN_FAILURE: user_id=${user.id}, reason=INVALID_PASSWORD`);
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    // Reset failed attempts on successful login
    await this.db.query(
      `UPDATE users SET failed_login_attempts = 0, last_login_at = NOW() WHERE id = $1`,
      [user.id],
    );

    // Get user roles
    const rolesResult = await this.db.query<{ role_id: string; role_name: string; is_superadmin: boolean }>(
      `SELECT r.id as role_id, r.name as role_name, ur.is_superadmin
       FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = $1`,
      [user.id],
    );

    const roles = rolesResult.rows.map((r) => r.role_name);
    const isSuperAdmin = rolesResult.rows.some((r) => r.is_superadmin);

    // Generate JWT
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles,
      isSuperAdmin,
    };

    const access_token = this.jwtService.sign(payload);

    // Success: log user_id only (no PII)
    this.logger.log(`LOGIN_SUCCESS: user_id=${user.id}`);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        roles: rolesResult.rows.map((r) => ({ id: r.role_id, name: r.role_name })),
      },
    };
  }

  async validateUserById(userId: string): Promise<UserProfile | null> {
    const userResult = await this.db.query<{
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      avatar_url: string | null;
      is_active: boolean;
    }>(
      `SELECT id, email, first_name, last_name, avatar_url, is_active
       FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [userId],
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
      return null;
    }

    const user = userResult.rows[0];

    // Get roles
    const rolesResult = await this.db.query<{ id: string; name: string; is_superadmin: boolean }>(
      `SELECT r.id, r.name, ur.is_superadmin
       FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = $1`,
      [userId],
    );

    // Get permissions
    const permissionsResult = await this.db.query<{ name: string }>(
      `SELECT DISTINCT p.name
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       JOIN user_roles ur ON rp.role_id = ur.role_id
       WHERE ur.user_id = $1`,
      [userId],
    );

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar_url: user.avatar_url,
      roles: rolesResult.rows.map((r) => ({ id: r.id, name: r.name })),
      is_superadmin: rolesResult.rows.some((r) => r.is_superadmin),
      permissions: permissionsResult.rows.map((p) => p.name),
    };
  }

  async isSuperAdmin(userId: string): Promise<boolean> {
    const result = await this.db.query<{ exists: boolean }>(
      `SELECT EXISTS(SELECT 1 FROM user_roles WHERE user_id = $1 AND is_superadmin = TRUE) as exists`,
      [userId],
    );
    return result.rows[0]?.exists ?? false;
  }

  async hasRole(userId: string, roleNames: string[]): Promise<boolean> {
    const result = await this.db.query<{ exists: boolean }>(
      `SELECT EXISTS(
        SELECT 1 FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = $1 AND r.name = ANY($2)
      ) as exists`,
      [userId, roleNames],
    );
    return result.rows[0]?.exists ?? false;
  }

  async googleLogin(profile: GoogleProfile): Promise<{ access_token: string; user: Partial<UserProfile> }> {
    // Find existing user by google_id or email
    let userResult = await this.db.query<{
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      is_active: boolean;
      google_id: string | null;
    }>(
      `SELECT id, email, first_name, last_name, is_active, google_id
       FROM users WHERE (google_id = $1 OR email = $2) AND deleted_at IS NULL`,
      [profile.googleId, profile.email],
    );

    let userId: string;

    if (userResult.rows.length === 0) {
      // Create new user (auto-provision)
      const createResult = await this.db.query<{ id: string }>(
        `INSERT INTO users (email, password_hash, first_name, last_name, google_id, avatar_url, is_active)
         VALUES ($1, '', $2, $3, $4, $5, TRUE)
         RETURNING id`,
        [profile.email, profile.firstName, profile.lastName, profile.googleId, profile.avatar],
      );
      userId = createResult.rows[0].id;

      // Assign default Staff role for edu domain users
      const staffRoleResult = await this.db.query<{ id: string }>(
        `SELECT id FROM roles WHERE name = 'Staff' LIMIT 1`,
      );

      if (staffRoleResult.rows.length > 0) {
        await this.db.query(
          `INSERT INTO user_roles (user_id, role_id, assigned_by, created_by)
           VALUES ($1, $2, $1, $1)`,
          [userId, staffRoleResult.rows[0].id],
        );
      }

      this.logger.log(`GOOGLE_USER_CREATED: user_id=${userId}, domain=${profile.domain}`);
    } else {
      const user = userResult.rows[0];

      if (!user.is_active) {
        this.logger.warn(`GOOGLE_SSO_REJECTED: user_id=${user.id}, reason=ACCOUNT_INACTIVE`);
        throw new UnauthorizedException('INVALID_CREDENTIALS');
      }

      // Update google_id if not set (linking existing account)
      if (!user.google_id) {
        await this.db.query(
          `UPDATE users SET google_id = $1, avatar_url = COALESCE(avatar_url, $2), updated_at = NOW() WHERE id = $3`,
          [profile.googleId, profile.avatar, user.id],
        );
      }

      userId = user.id;
    }

    // Update last login
    await this.db.query(`UPDATE users SET last_login_at = NOW() WHERE id = $1`, [userId]);

    // Get user roles
    const rolesResult = await this.db.query<{ role_id: string; role_name: string; is_superadmin: boolean }>(
      `SELECT r.id as role_id, r.name as role_name, ur.is_superadmin
       FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = $1`,
      [userId],
    );

    const roles = rolesResult.rows.map((r) => r.role_name);
    const isSuperAdmin = rolesResult.rows.some((r) => r.is_superadmin);

    // Generate JWT
    const payload: JwtPayload = {
      sub: userId,
      email: profile.email,
      roles,
      isSuperAdmin,
      };

    const access_token = this.jwtService.sign(payload);

    this.logger.log(`GOOGLE_SSO_SUCCESS: user_id=${userId}`);

    // Fetch full user for response
    const fullUser = await this.db.query<{ first_name: string; last_name: string }>(
      `SELECT first_name, last_name FROM users WHERE id = $1`,
      [userId],
    );

    return {
      access_token,
      user: {
        id: userId,
        email: profile.email,
        first_name: fullUser.rows[0].first_name,
        last_name: fullUser.rows[0].last_name,
        roles: rolesResult.rows.map((r) => ({ id: r.role_id, name: r.role_name })),
      },
    };
  }

  private async incrementFailedAttempts(userId: string, currentAttempts: number): Promise<void> {
    const maxAttempts = 5;
    const lockDurationMinutes = 15;
    const newAttempts = currentAttempts + 1;

    if (newAttempts >= maxAttempts) {
      const lockUntil = new Date(Date.now() + lockDurationMinutes * 60 * 1000);
      await this.db.query(
        `UPDATE users SET failed_login_attempts = $1, account_locked_until = $2 WHERE id = $3`,
        [newAttempts, lockUntil, userId],
      );
      this.logger.warn(`ACCOUNT_LOCKED: user_id=${userId}, locked_until=${lockUntil.toISOString()}`);
    } else {
      await this.db.query(
        `UPDATE users SET failed_login_attempts = $1 WHERE id = $2`,
        [newAttempts, userId],
      );
    }
  }
}
