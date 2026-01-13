import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthService, UserProfile } from '../auth.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: UserProfile = request.user;

    if (!user) {
      return false;
    }

    // SuperAdmin bypass
    if (user.is_superadmin) {
      return true;
    }

    // Check if user has any of the required roles
    const userRoleNames = user.roles.map((r) => r.name);
    return requiredRoles.some((role) => userRoleNames.includes(role));
  }
}
