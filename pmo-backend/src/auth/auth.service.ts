import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { EntityManager } from '@mikro-orm/core';
import { JwtPayload } from '../common/interfaces';
import { LoginDto } from './dto';
import {
  User,
  UserRole,
  Role,
  Permission,
  RolePermission,
  UserPermissionOverride,
  UserModuleAssignment,
  UserPillarAssignment,
  PasswordResetRequest,
} from '../database/entities';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(identifier: string, password: string): Promise<any> {
    const user = await this.em.findOne(User, {
      $or: [
        { email: { $ilike: identifier } },
        { username: { $ilike: identifier } },
      ],
    });

    if (!user) {
      return null;
    }

    // Check if account is locked
    if (
      user.accountLockedUntil &&
      new Date(user.accountLockedUntil) > new Date()
    ) {
      this.logger.warn(
        `LOGIN_FAILURE: user_id=${user.id}, reason=ACCOUNT_LOCKED`,
      );
      return null;
    }

    // Check if account is active
    if (!user.isActive) {
      this.logger.warn(
        `LOGIN_FAILURE: user_id=${user.id}, reason=ACCOUNT_INACTIVE`,
      );
      return null;
    }

    // SSO-only account sentinel
    if (user.googleId && (!user.passwordHash || user.passwordHash === '')) {
      this.logger.warn(
        `LOGIN_FAILURE: user_id=${user.id}, reason=SSO_ONLY_ACCOUNT`,
      );
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash || '');
    if (!isValid) {
      const attempts = (user.failedLoginAttempts ?? 0) + 1;
      user.failedLoginAttempts = attempts;
      if (attempts >= 5) {
        user.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await this.em.flush();
      this.logger.warn(
        `LOGIN_FAILURE: user_id=${user.id}, reason=INVALID_PASSWORD`,
      );
      return null;
    }

    // Reset failed attempts on success
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = undefined;
    await this.em.flush();

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      password_hash: user.passwordHash,
      is_active: user.isActive,
      google_id: user.googleId,
      failed_login_attempts: user.failedLoginAttempts,
      account_locked_until: user.accountLockedUntil,
      first_name: user.firstName,
      last_name: user.lastName,
      rank_level: user.rankLevel,
      campus: user.campus,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.identifier, dto.password);

    if (!user) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    // Aggregate roles
    const userRoles = await this.em.find(
      UserRole,
      { userId: user.id },
      { filters: false },
    );
    const roleIds = userRoles.map((ur) => ur.roleId);
    const roleEntities =
      roleIds.length > 0
        ? await this.em.find(Role, { id: { $in: roleIds } })
        : [];
    const roleNameById = new Map(roleEntities.map((r) => [r.id, r.name]));
    const roles = userRoles
      .map((ur) => roleNameById.get(ur.roleId))
      .filter(Boolean) as string[];
    const is_superadmin = userRoles.some((ur) => ur.isSuperadmin);

    // Aggregate permissions via role_permissions
    let permissions: string[] = [];
    if (roleIds.length > 0) {
      const rolePerms = await this.em.find(
        RolePermission,
        { roleId: { $in: roleIds } },
        { filters: false },
      );
      const permIds = Array.from(
        new Set(rolePerms.map((rp) => rp.permissionId)),
      );
      if (permIds.length > 0) {
        const permEntities = await this.em.find(Permission, {
          id: { $in: permIds },
        });
        permissions = Array.from(new Set(permEntities.map((p) => p.name)));
      }
    }

    // Module overrides
    const overrides = await this.em.find(
      UserPermissionOverride,
      { userId: user.id },
      { filters: false },
    );
    const module_overrides = overrides.reduce(
      (acc, o) => {
        acc[o.moduleKey] = o.canAccess;
        return acc;
      },
      {} as Record<string, boolean>,
    );

    // Module assignments
    const moduleAssignments = await this.em.find(
      UserModuleAssignment,
      { userId: user.id },
      { filters: false },
    );
    const module_assignments = moduleAssignments.map((m) => m.module);

    // Pillar assignments
    let pillar_assignments: string[] = [];
    try {
      const pillars = await this.em.find(
        UserPillarAssignment,
        { userId: user.id },
        { filters: false },
      );
      pillar_assignments = pillars.map((p) => p.pillarType);
    } catch {
      this.logger.warn(
        `PILLAR_RBAC_UNAVAILABLE: defaulting to [] for user=${user.id}`,
      );
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles,
      is_superadmin,
      campus: user.campus || undefined,
    };

    this.logger.log(
      `LOGIN_SUCCESS: user_id=${user.id}, superadmin=${is_superadmin}`,
    );

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
        pillar_assignments,
        rank_level: user.rank_level,
        campus: user.campus,
        role: roles.length > 0 ? { name: roles[0] } : undefined,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Roles (with id)
    const userRoles = await this.em.find(
      UserRole,
      { userId },
      { filters: false },
    );
    const roleIds = userRoles.map((ur) => ur.roleId);
    const roleEntities =
      roleIds.length > 0
        ? await this.em.find(Role, { id: { $in: roleIds } })
        : [];
    const roleById = new Map(roleEntities.map((r) => [r.id, r]));
    const rolesData = userRoles.map((ur) => ({
      id: ur.roleId,
      name: roleById.get(ur.roleId)?.name || '',
      is_superadmin: ur.isSuperadmin,
    }));

    // Permissions
    let permissions: string[] = [];
    if (roleIds.length > 0) {
      const rolePerms = await this.em.find(
        RolePermission,
        { roleId: { $in: roleIds } },
        { filters: false },
      );
      const permIds = Array.from(
        new Set(rolePerms.map((rp) => rp.permissionId)),
      );
      if (permIds.length > 0) {
        const permEntities = await this.em.find(Permission, {
          id: { $in: permIds },
        });
        permissions = Array.from(new Set(permEntities.map((p) => p.name)));
      }
    }

    // Module overrides
    const overrides = await this.em.find(
      UserPermissionOverride,
      { userId },
      { filters: false },
    );
    const module_overrides = overrides.reduce(
      (acc, o) => {
        acc[o.moduleKey] = o.canAccess;
        return acc;
      },
      {} as Record<string, boolean>,
    );

    // Module assignments
    const moduleAssignments = await this.em.find(
      UserModuleAssignment,
      { userId },
      { filters: false },
    );
    const module_assignments = moduleAssignments.map((m) => m.module);

    // Pillar assignments
    let pillar_assignments: string[] = [];
    try {
      const pillars = await this.em.find(
        UserPillarAssignment,
        { userId },
        { filters: false },
      );
      pillar_assignments = pillars.map((p) => p.pillarType);
    } catch {
      this.logger.warn(
        `PILLAR_RBAC_UNAVAILABLE: defaulting to [] for user=${userId}`,
      );
    }

    const roles = rolesData.map((r) => ({ id: r.id, name: r.name }));

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      first_name: user.firstName,
      last_name: user.lastName,
      avatar_url: user.avatarUrl,
      rank_level: user.rankLevel,
      campus: user.campus,
      roles,
      is_superadmin: rolesData.some((r) => r.is_superadmin),
      permissions,
      module_overrides,
      module_assignments,
      pillar_assignments,
      role: roles.length > 0 ? { name: roles[0].name } : undefined,
    };
  }

  async logout(userId: string): Promise<void> {
    this.logger.log(`LOGOUT: user_id=${userId}`);
  }

  async createPasswordResetRequest(
    identifier: string,
    notes?: string,
  ): Promise<{ message: string }> {
    try {
      const entity = this.em.create(PasswordResetRequest, {
        identifier,
        notes: notes ?? undefined,
      });
      await this.em.persistAndFlush(entity);
      this.logger.log(`PASSWORD_RESET_REQUEST: identifier=${identifier}`);
    } catch (err) {
      this.logger.warn(
        `PASSWORD_RESET_REQUEST_FAILED: identifier=${identifier}, error=${err.message}`,
      );
    }
    return {
      message: 'Reset request submitted. An administrator will contact you.',
    };
  }

  private async buildSsoTokenForUser(
    userId: string,
  ): Promise<{ access_token: string }> {
    const userRoles = await this.em.find(
      UserRole,
      { userId },
      { filters: false },
    );
    const roleIds = userRoles.map((ur) => ur.roleId);
    const roleEntities =
      roleIds.length > 0
        ? await this.em.find(Role, { id: { $in: roleIds } })
        : [];
    const roleNameById = new Map(roleEntities.map((r) => [r.id, r.name]));
    const roles = userRoles
      .map((ur) => roleNameById.get(ur.roleId))
      .filter(Boolean) as string[];
    const is_superadmin = userRoles.some((ur) => ur.isSuperadmin);

    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload: JwtPayload = {
      sub: userId,
      email: user.email,
      roles,
      is_superadmin,
      campus: user.campus || undefined,
    };

    return { access_token: this.jwtService.sign(payload) };
  }

  async loginWithLdapUser(userId: string): Promise<{ access_token: string }> {
    const token = await this.buildSsoTokenForUser(userId);
    this.logger.log(`LDAP_LOGIN_SUCCESS: user_id=${userId}`);
    return token;
  }

  async loginWithGoogleUser(userId: string): Promise<{ access_token: string }> {
    const token = await this.buildSsoTokenForUser(userId);
    this.logger.log(`GOOGLE_LOGIN_SUCCESS: user_id=${userId}`);
    return token;
  }
}
