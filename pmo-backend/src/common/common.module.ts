import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PermissionResolverService } from './services';
import { User, UserRole, UserModuleAssignment } from '../database/entities';

/**
 * Common Module
 *
 * Provides shared services across the application.
 * Per ACE governance Phase Q: Centralizes permission resolver logic.
 */
@Global()
@Module({
  imports: [MikroOrmModule.forFeature([User, UserRole, UserModuleAssignment])],
  providers: [PermissionResolverService],
  exports: [PermissionResolverService],
})
export class CommonModule {}
