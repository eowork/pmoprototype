import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ActivityLogModule } from '../activity-logs/activity-log.module';
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
    ActivityLogModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
