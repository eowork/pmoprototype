import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { JwtPayload } from '../interfaces';

/**
 * Permission Result for detailed responses
 */
export interface PermissionResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Centralized Permission Resolver Service
 *
 * Consolidates permission logic previously scattered across service methods.
 * Per ACE governance Phase Q (plan.md), this replaces ad-hoc isAdmin() checks.
 *
 * GOVERNANCE REFERENCE: research.md Section 1.35
 * - Rank is APPROVAL-AUTHORITY ONLY, not CRUD-tier
 * - Role determines CRUD capability (SuperAdmin, Admin, Staff, Viewer)
 * - Rank determines approval chain (lower rank_level = higher authority)
 */
@Injectable()
export class PermissionResolverService {
  private readonly logger = new Logger(PermissionResolverService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Check if user has Admin role (from JWT - for read operations)
   * Use this for non-mutation operations where JWT can be trusted
   */
  isAdmin(user: JwtPayload): boolean {
    return user.is_superadmin || user.roles.includes('Admin');
  }

  /**
   * Check if user has Staff role (from JWT)
   */
  isStaff(user: JwtPayload): boolean {
    return this.isAdmin(user) || user.roles.includes('Staff');
  }

  /**
   * Check if user has Admin role (from database - for mutation operations)
   * This prevents JWT token manipulation attacks for critical operations
   */
  async isAdminFromDatabase(userId: string): Promise<boolean> {
    const result = await this.db.query(
      `SELECT COALESCE(
                (SELECT TRUE
                 FROM user_roles ur
                 WHERE ur.user_id = $1 AND ur.is_superadmin = TRUE
                 LIMIT 1),
                FALSE
              ) as is_superadmin,
              COALESCE(
                (SELECT array_agg(r.name)
                 FROM user_roles ur
                 JOIN roles r ON r.id = ur.role_id
                 WHERE ur.user_id = $1),
                ARRAY[]::varchar[]
              ) as roles`,
      [userId],
    );

    if (result.rows.length === 0) {
      return false;
    }

    const { is_superadmin, roles } = result.rows[0];
    return is_superadmin || roles.includes('Admin');
  }

  /**
   * Check if approver can approve a submission based on rank authority
   *
   * Rules (per research.md Section 1.35):
   * - SuperAdmin bypasses rank check
   * - Approver must have lower rank_level (higher authority) than submitter
   * - Equal rank cannot approve each other
   *
   * @param approverId - The user attempting to approve
   * @param submitterId - The user who created/submitted the record
   * @param isSuperAdmin - Whether the approver is SuperAdmin (bypasses rank check)
   */
  async canApproveByRank(
    approverId: string,
    submitterId: string,
    isSuperAdmin: boolean,
  ): Promise<PermissionResult> {
    // SuperAdmin bypasses rank check
    if (isSuperAdmin) {
      return { allowed: true };
    }

    // Self-approval prevention
    if (approverId === submitterId) {
      return {
        allowed: false,
        reason: 'Cannot approve your own submission',
      };
    }

    // Fetch both users' rank levels in a single query
    const result = await this.db.query(
      `SELECT
        (SELECT rank_level FROM users WHERE id = $1 AND deleted_at IS NULL) as approver_rank,
        (SELECT rank_level FROM users WHERE id = $2 AND deleted_at IS NULL) as submitter_rank`,
      [approverId, submitterId],
    );

    const approverLevel = result.rows[0]?.approver_rank ?? 100;
    const submitterLevel = result.rows[0]?.submitter_rank ?? 100;

    // Lower rank_level = higher authority
    // Approver must have strictly lower rank_level than submitter
    if (approverLevel >= submitterLevel) {
      this.logger.debug(
        `RANK_APPROVAL_DENIED: approver=${approverId} (rank ${approverLevel}) ` +
        `cannot approve submitter=${submitterId} (rank ${submitterLevel})`,
      );
      return {
        allowed: false,
        reason: 'Insufficient authority: Your rank does not allow you to approve this submission',
      };
    }

    return { allowed: true };
  }

  /**
   * Check if user can modify a target user based on rank hierarchy
   *
   * Rules:
   * - SuperAdmin can modify anyone
   * - Others can only modify users with higher rank_level (lower authority)
   *
   * @param actorId - The user performing the modification
   * @param targetId - The user being modified
   * @param isSuperAdmin - Whether the actor is SuperAdmin
   */
  async canModifyUserByRank(
    actorId: string,
    targetId: string,
    isSuperAdmin: boolean,
  ): Promise<PermissionResult> {
    // SuperAdmin can modify anyone
    if (isSuperAdmin) {
      return { allowed: true };
    }

    // Cannot modify yourself via this check (self-edit handled elsewhere)
    if (actorId === targetId) {
      return { allowed: true };
    }

    // Use database function for rank comparison
    const result = await this.db.query(
      `SELECT can_modify_user($1, $2) as can_modify`,
      [actorId, targetId],
    );

    if (!result.rows[0]?.can_modify) {
      return {
        allowed: false,
        reason: 'Insufficient authority: Cannot modify a user with equal or higher rank',
      };
    }

    return { allowed: true };
  }

  /**
   * Check if user has module assignment for approval
   *
   * @param userId - The user to check
   * @param module - Module type ('CONSTRUCTION', 'REPAIR', 'OPERATIONS', 'ALL')
   */
  async hasModuleAssignment(userId: string, module: string): Promise<boolean> {
    const result = await this.db.query(
      `SELECT user_has_module_access($1, $2::module_type) as has_access`,
      [userId, module],
    );
    return result.rows[0]?.has_access ?? false;
  }
}
