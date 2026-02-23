import { Module, Global } from '@nestjs/common';
import { PermissionResolverService } from './services';

/**
 * Common Module
 *
 * Provides shared services across the application.
 * Per ACE governance Phase Q: Centralizes permission resolver logic.
 */
@Global()
@Module({
  providers: [PermissionResolverService],
  exports: [PermissionResolverService],
})
export class CommonModule {}
