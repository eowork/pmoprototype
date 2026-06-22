import { SetMetadata } from '@nestjs/common';

/**
 * PHASE BBBA (Track 1, BBBA-1c) — module-access enforcement.
 *
 * Marks a controller (or handler) as requiring access to a named module. The
 * `moduleKey` MUST match the keys used in `user_permission_overrides.module_key`
 * and the frontend `usePermissions` map — e.g. 'coi', 'repairs',
 * 'university_operations'. Enforced by `ModuleAccessGuard`.
 *
 * Resolution (default-DENY): SuperAdmin and Admin bypass; Contractor → 'coi' only;
 * everyone else requires an explicit `can_access = true` override row.
 */
export const REQUIRE_MODULE_KEY = 'required_module';
export const RequireModule = (moduleKey: string) =>
  SetMetadata(REQUIRE_MODULE_KEY, moduleKey);
