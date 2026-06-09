import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import {
  User,
  Role,
  UserRole,
  Permission,
  RolePermission,
  UserPermissionOverride,
  UserModuleAssignment,
  UserPillarAssignment,
  PasswordResetRequest,
} from '../database/entities';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      User,
      Role,
      UserRole,
      Permission,
      RolePermission,
      UserPermissionOverride,
      UserModuleAssignment,
      UserPillarAssignment,
      PasswordResetRequest,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
