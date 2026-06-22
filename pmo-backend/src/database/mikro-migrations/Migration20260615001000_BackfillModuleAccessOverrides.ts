import { Migration } from '@mikro-orm/migrations';

/**
 * PHASE BBBA (BBBA-1a) — preserve existing users' access BEFORE the default-DENY flip.
 *
 * Until now `usePermissions.canAccessModule()` defaulted authenticated non-admin users to
 * ALLOW for all non-admin modules. PHASE BBBA flips this to default-DENY (frontend) plus a
 * backend `ModuleAccessGuard`. To avoid locking out current users on their next login, this
 * migration grants explicit `user_permission_overrides` (can_access = true) for the three
 * gated modules to every ACTIVE user who is NOT SuperAdmin, NOT Admin, and NOT Contractor
 * (SuperAdmin/Admin bypass the guard; Contractors are COI-scoped by the guard itself).
 *
 * Idempotent: skips any (user, module) pair that already has an override row.
 * down() is intentionally a no-op — backfilled grants are indistinguishable from
 * admin-created ones, so we never bulk-delete them.
 */
const MODULES = ['coi', 'repairs', 'university_operations'];

export class Migration20260615001000_BackfillModuleAccessOverrides extends Migration {
  async up(): Promise<void> {
    for (const moduleKey of MODULES) {
      this.addSql(
        `
        INSERT INTO user_permission_overrides (user_id, module_key, can_access, created_at, updated_at)
        SELECT u.id, '${moduleKey}', true, NOW(), NOW()
        FROM users u
        WHERE u.deleted_at IS NULL
          AND u.is_active = true
          AND NOT EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = u.id AND ur.is_superadmin = true
          )
          AND NOT EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON r.id = ur.role_id
            WHERE ur.user_id = u.id AND r.name IN ('Admin', 'Contractor')
          )
          AND NOT EXISTS (
            SELECT 1 FROM user_permission_overrides o
            WHERE o.user_id = u.id AND o.module_key = '${moduleKey}'
          )
        `,
      );
    }
  }

  async down(): Promise<void> {
    // No-op: do not bulk-delete grants (cannot distinguish backfill from admin-created).
  }
}
