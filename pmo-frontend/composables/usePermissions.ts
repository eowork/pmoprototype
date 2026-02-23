/**
 * Permission Composable - Role-based authorization for UI elements
 *
 * Implements Tier 1 authorization model with override support.
 * Permission resolution order: SuperAdmin > User Override > Role Default > Deny
 *
 * Role Hierarchy:
 * - SuperAdmin: Full access to all modules, bypasses all checks
 * - Admin: Full CRUD on assigned modules (not User Management by default)
 * - Staff: CRU on assigned modules (no Delete)
 * - Viewer: Read-only access
 */

export interface ModulePermissions {
  canView: boolean
  canAdd: boolean
  canEdit: boolean
  canDelete: boolean
}

export type RoleName = 'SuperAdmin' | 'Admin' | 'Staff' | 'Viewer' | string

/**
 * Module key mapping for consistency between routes and overrides
 * Route path (e.g., /coi) -> Override key (e.g., coi)
 */
const MODULE_KEY_MAP: Record<string, string> = {
  'coi': 'coi',
  'repairs': 'repairs',
  'contractors': 'contractors',
  'funding-sources': 'funding_sources',
  'funding_sources': 'funding_sources',
  'university-operations': 'university_operations',
  'university_operations': 'university_operations',
  'users': 'users',
}

/**
 * Default permission matrix by role
 * Maps role names to CRUD capabilities
 *
 * NOTE: Universal Draft Governance (Feb 15, 2026)
 * - Staff can create and edit records (all saved as DRAFT)
 * - ALL users (Staff, Admin, SuperAdmin) create DRAFT initially
 * - Publishing requires explicit approval action by authorized Admin
 * - Staff cannot delete records or publish (requires Admin approval)
 * - See research.md Section 1.29 for rationale
 */
const ROLE_PERMISSIONS: Record<RoleName, ModulePermissions> = {
  SuperAdmin: { canView: true, canAdd: true, canEdit: true, canDelete: true },
  Admin: { canView: true, canAdd: true, canEdit: true, canDelete: true },
  Staff: { canView: true, canAdd: true, canEdit: true, canDelete: false },
  Viewer: { canView: true, canAdd: false, canEdit: false, canDelete: false },
}

/**
 * Modules that require Admin or SuperAdmin access by default (no override)
 * Includes User Management and Reference Data modules (Contractors, Funding Sources)
 * Per research.md Section 1.33.E: Reference Data hidden from sidebar for non-Admin users
 */
const ADMIN_ONLY_MODULES = ['users', 'contractors', 'funding-sources', 'funding_sources']

/**
 * Reference data modules - Contractors and Funding Sources
 *
 * PURPOSE CLARIFICATION (Phase R cleanup):
 * - ADMIN_ONLY_MODULES: Controls sidebar visibility (Admin/SuperAdmin see menu items)
 * - REFERENCE_DATA_MODULES: Controls form-level access (Staff can read for dropdowns)
 *
 * Even though these overlap with ADMIN_ONLY_MODULES, this constant is still used
 * in getModulePermissions() to grant Staff view-only access when accessing
 * contractor/funding source data via form dropdowns or API calls.
 */
const REFERENCE_DATA_MODULES = ['contractors', 'funding-sources', 'funding_sources']

export function usePermissions() {
  const authStore = useAuthStore()

  /**
   * Check if current user is SuperAdmin
   */
  const isSuperAdmin = computed(() => {
    return authStore.user?.isSuperAdmin ?? false
  })

  /**
   * Check if current user is Admin (or higher)
   */
  const isAdmin = computed(() => {
    if (isSuperAdmin.value) return true
    const roleName = authStore.user?.roleName?.toLowerCase() ?? ''
    return roleName === 'admin'
  })

  /**
   * Check if current user is Staff (or higher)
   */
  const isStaff = computed(() => {
    if (isAdmin.value) return true
    const roleName = authStore.user?.roleName?.toLowerCase() ?? ''
    return roleName === 'staff'
  })

  /**
   * Get the current user's role name
   */
  const currentRole = computed((): RoleName => {
    if (isSuperAdmin.value) return 'SuperAdmin'
    const roleName = authStore.user?.roleName ?? ''
    // Normalize role name to match our permission matrix
    if (roleName.toLowerCase() === 'admin') return 'Admin'
    if (roleName.toLowerCase() === 'staff') return 'Staff'
    if (roleName.toLowerCase() === 'viewer') return 'Viewer'
    return roleName || 'Viewer' // Default to Viewer for unknown roles
  })

  /**
   * Get user's module overrides
   */
  const moduleOverrides = computed(() => {
    return authStore.user?.moduleOverrides ?? {}
  })

  /**
   * Get user's module assignments (for approval visibility)
   */
  const moduleAssignments = computed(() => {
    return authStore.user?.moduleAssignments ?? []
  })

  /**
   * Get user's rank level
   *
   * GOVERNANCE DECISION (research.md Section 1.35):
   * Rank is APPROVAL-AUTHORITY ONLY, not CRUD-tier.
   * - Used for: approval chain validation, user hierarchy management
   * - NOT used for: canAdd, canEdit, canDelete (these are role-based)
   *
   * Lower rank_level = higher authority (10 = SuperAdmin, 100 = Viewer)
   */
  const rankLevel = computed(() => {
    return authStore.user?.rankLevel ?? 100
  })

  /**
   * Normalize module ID to override key
   */
  function normalizeModuleKey(moduleId: string): string {
    const lowered = moduleId.toLowerCase()
    return MODULE_KEY_MAP[lowered] || lowered
  }

  /**
   * Check if user has an override for a module
   * Returns: true (granted), false (revoked), or undefined (use role default)
   */
  function getModuleOverride(moduleId: string): boolean | undefined {
    const key = normalizeModuleKey(moduleId)
    const overrides = moduleOverrides.value
    if (key in overrides) {
      return overrides[key]
    }
    return undefined
  }

  /**
   * Check if user can access a module (for sidebar filtering)
   * Resolution: SuperAdmin > Override > Role Default
   */
  function canAccessModule(moduleId: string): boolean {
    // SuperAdmin bypasses all checks
    if (isSuperAdmin.value) return true

    // Check for user override first
    const override = getModuleOverride(moduleId)
    if (override !== undefined) {
      return override
    }

    // Fall back to role-based defaults
    const role = currentRole.value
    const normalizedId = moduleId.toLowerCase()

    // Admin-only modules (users)
    if (ADMIN_ONLY_MODULES.includes(normalizedId)) {
      return role === 'Admin' || role === 'SuperAdmin'
    }

    // All other modules accessible by default for authenticated users
    return true
  }

  /**
   * Get permissions for a specific module
   */
  function getModulePermissions(moduleId: string): ModulePermissions {
    // SuperAdmin bypasses all checks
    if (isSuperAdmin.value) {
      return { canView: true, canAdd: true, canEdit: true, canDelete: true }
    }

    // Check if module access is denied via override
    const override = getModuleOverride(moduleId)
    if (override === false) {
      return { canView: false, canAdd: false, canEdit: false, canDelete: false }
    }

    const role = currentRole.value
    const normalizedId = moduleId.toLowerCase()

    // Admin-only modules
    if (ADMIN_ONLY_MODULES.includes(normalizedId)) {
      if (role === 'Admin' || role === 'SuperAdmin') {
        return ROLE_PERMISSIONS[role]
      }
      return { canView: false, canAdd: false, canEdit: false, canDelete: false }
    }

    // Reference data modules - Staff can only view
    if (REFERENCE_DATA_MODULES.includes(normalizedId)) {
      if (role === 'Staff') {
        return { canView: true, canAdd: false, canEdit: false, canDelete: false }
      }
      if (role === 'Viewer') {
        return { canView: true, canAdd: false, canEdit: false, canDelete: false }
      }
    }

    // Return role-based permissions
    return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.Viewer
  }

  /**
   * Check if user can view a module
   */
  function canView(moduleId: string): boolean {
    return getModulePermissions(moduleId).canView
  }

  /**
   * Check if user can add records to a module
   */
  function canAdd(moduleId: string): boolean {
    return getModulePermissions(moduleId).canAdd
  }

  /**
   * Check if user can edit records in a module
   */
  function canEdit(moduleId: string): boolean {
    return getModulePermissions(moduleId).canEdit
  }

  /**
   * Check if user can delete records in a module
   */
  function canDelete(moduleId: string): boolean {
    return getModulePermissions(moduleId).canDelete
  }

  /**
   * Check if user can approve records in a module (Draft Governance Workflow)
   *
   * Approval authority:
   * - SuperAdmin: Can approve any module
   * - Admin: Can approve modules they are assigned to via user_module_assignments
   * - Staff/Viewer: Cannot approve (must submit for review)
   *
   * @param moduleId - The module identifier (e.g., 'coi', 'repairs', 'university_operations')
   * @returns true if user can approve records in this module
   */
  function canApprove(moduleId: string): boolean {
    // SuperAdmin can approve everything
    if (isSuperAdmin.value) return true

    // Only Admins can approve (Staff/Viewer cannot)
    if (!isAdmin.value) return false

    // Admin must be assigned to the module
    const normalizedKey = normalizeModuleKey(moduleId)
    return moduleAssignments.value.includes(normalizedKey)
  }

  /**
   * Check if user can access administration section
   */
  const canAccessAdmin = computed(() => {
    return isSuperAdmin.value || canAccessModule('users')
  })

  /**
   * Check if user can manage users
   */
  const canManageUsers = computed(() => {
    return isSuperAdmin.value || canAccessModule('users')
  })

  return {
    // Role checks
    isSuperAdmin,
    isAdmin,
    isStaff,
    currentRole,
    rankLevel,

    // Module access (for sidebar filtering)
    canAccessModule,
    moduleOverrides,
    moduleAssignments,

    // Permission checks
    getModulePermissions,
    canView,
    canAdd,
    canEdit,
    canDelete,
    canApprove,

    // Special permissions
    canAccessAdmin,
    canManageUsers,
  }
}
