import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { createPaginatedResponse, PaginatedResponse } from '../common/dto';
import {
  CreateOperationDto,
  UpdateOperationDto,
  QueryOperationDto,
  CreateIndicatorDto,
  CreateIndicatorQuarterlyDto,
  CreateFinancialDto,
  FundType,
} from './dto';
import { JwtPayload } from '../common/interfaces';
import { PermissionResolverService } from '../common/services';

// Publication status values matching database enum
export type PublicationStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED';

@Injectable()
export class UniversityOperationsService {
  private readonly logger = new Logger(UniversityOperationsService.name);

  // Allowlisted columns for filtering/sorting
  private readonly ALLOWED_SORTS = ['created_at', 'title', 'status', 'start_date', 'end_date'];

  constructor(
    private readonly db: DatabaseService,
    private readonly permissionResolver: PermissionResolverService,
  ) {}

  /**
   * Delegate to centralized permission resolver
   * @deprecated Use this.permissionResolver.isAdmin() directly
   */
  private isAdmin(user: JwtPayload): boolean {
    return this.permissionResolver.isAdmin(user);
  }

  /**
   * Map user campus value to record campus value.
   * Phase AM: Users store 'Butuan Campus'/'Cabadbaran'; records store 'MAIN'/'CABADBARAN'.
   * Returns null when input is null/undefined/unmapped — caller falls back to no campus filter.
   */
  private normalizeUserCampusToRecordCampus(userCampus: string | null | undefined): string | null {
    if (!userCampus) return null;
    if (userCampus === 'Butuan Campus') return 'MAIN';
    if (userCampus === 'Cabadbaran') return 'CABADBARAN';
    return null;
  }

  /**
   * Phase AT: Update record assignments in junction table
   * Replaces all existing assignments for a record with new user IDs
   */
  private async updateRecordAssignments(recordId: string, userIds: string[]): Promise<void> {
    await this.db.query(
      `DELETE FROM record_assignments WHERE module = 'OPERATIONS' AND record_id = $1`,
      [recordId],
    );
    for (const userId of userIds) {
      await this.db.query(
        `INSERT INTO record_assignments (module, record_id, user_id) VALUES ('OPERATIONS', $1, $2)
         ON CONFLICT (module, record_id, user_id) DO NOTHING`,
        [recordId, userId],
      );
    }
  }

  /**
   * Phase AT: Check if user is assigned to record via junction table
   */
  private async isUserAssigned(recordId: string, userId: string): Promise<boolean> {
    const result = await this.db.query(
      `SELECT 1 FROM record_assignments WHERE module = 'OPERATIONS' AND record_id = $1 AND user_id = $2`,
      [recordId, userId],
    );
    return result.rows.length > 0;
  }

  // ─── Phase CM/CN: Authorization Validation Helpers ───────────────────────────

  /**
   * Phase CM: Validates that the requesting user owns the operation or has Admin role.
   * Staff can only modify operations they created or are assigned to.
   * Throws ForbiddenException if validation fails.
   */
  private async validateOperationOwnership(
    operationId: string,
    userId: string,
    user: JwtPayload,
  ): Promise<void> {
    // Admins can modify any operation
    if (this.isAdmin(user)) {
      return;
    }

    // Check if user created the operation
    const result = await this.db.query(
      `SELECT created_by FROM university_operations WHERE id = $1 AND deleted_at IS NULL`,
      [operationId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('Operation not found');
    }

    const isOwner = result.rows[0].created_by === userId;
    const isAssigned = await this.isUserAssigned(operationId, userId);

    if (!isOwner && !isAssigned) {
      throw new ForbiddenException(
        'You do not have permission to modify this operation. Only the owner or assigned users can make changes.',
      );
    }
  }

  /**
   * Phase CO: Validates that operation is in DRAFT or PENDING_REVIEW status.
   * Throws ForbiddenException if operation is PUBLISHED.
   * Published operations represent final, approved data submitted to COA/DBM.
   *
   * Phase ER-B: When quarter is provided, also checks that the quarterly report
   * for the operation's fiscal year + that quarter is not PUBLISHED.
   */
  private async validateOperationEditable(operationId: string, quarter?: string, user?: JwtPayload): Promise<void> {
    let result;

    if (quarter) {
      // Phase ER-B: JOIN quarterly_reports to enforce edit lock on published quarters
      // Phase GOV-C: Also fetch unlocked_by for strict admin unlock enforcement
      result = await this.db.query(
        `SELECT uo.publication_status, qr.publication_status AS quarterly_status,
                qr.unlocked_by
         FROM university_operations uo
         LEFT JOIN quarterly_reports qr
           ON qr.fiscal_year = uo.fiscal_year AND qr.quarter = $2
              AND qr.deleted_at IS NULL
         WHERE uo.id = $1 AND uo.deleted_at IS NULL`,
        [operationId, quarter],
      );
    } else {
      result = await this.db.query(
        `SELECT uo.publication_status
         FROM university_operations uo
         WHERE uo.id = $1 AND uo.deleted_at IS NULL`,
        [operationId],
      );
    }

    if (result.rowCount === 0) {
      throw new NotFoundException('Operation not found');
    }

    const row = result.rows[0];
    if (row.publication_status === 'PUBLISHED') {
      throw new ForbiddenException(
        'Cannot modify indicators/financials on published operations. Withdraw to draft status first.',
      );
    }

    // Phase GOV-C: Strict unlock enforcement for Admin on PUBLISHED quarterly reports
    // SuperAdmin retains full bypass; Admin must have explicit unlock approval
    if (user && user.is_superadmin) {
      return; // SuperAdmin: full override, no unlock required
    }

    if (user && this.permissionResolver.isAdmin(user)) {
      if (quarter && row.quarterly_status === 'PUBLISHED' && !row.unlocked_by) {
        throw new ForbiddenException(
          'This quarterly report is published. An unlock must be approved before editing.',
        );
      }
      return; // Admin with unlock approval or non-PUBLISHED: allow edit
    }

    if (quarter && row.quarterly_status === 'PUBLISHED') {
      throw new ForbiddenException(
        'Cannot modify indicators/financials: the quarterly report for this period has been published.',
      );
    }
  }

  // ─── Phase CP: Financial Metrics Computation ─────────────────────────────────

  /**
   * Phase CP: Computes derived financial metrics based on BAR1 formulas.
   * These are calculated on-read (not stored) to ensure data integrity.
   *
   * @param record - Raw financial record from database
   * @returns Record with computed metrics added
   */
  private computeFinancialMetrics(record: any): any {
    const allotment = parseFloat(record.allotment) || 0;
    const target = parseFloat(record.target) || 0;
    const obligation = parseFloat(record.obligation) || 0;
    const disbursement = parseFloat(record.disbursement) || 0;

    // BAR1 Formula: Variance = Target - Obligation
    const variance = target > 0 && obligation > 0 ? target - obligation : null;

    // BAR1 Formula: Utilization Rate = (Obligation / Allotment) × 100
    const utilization_rate = allotment > 0 ? (obligation / allotment) * 100 : null;

    // BAR1 Formula: Balance = Allotment - Disbursement
    const balance = allotment > 0 ? allotment - disbursement : null;

    // BAR1 Formula: Disbursement Rate = (Disbursement / Obligation) × 100
    const disbursement_rate = obligation > 0 ? (disbursement / obligation) * 100 : null;

    return {
      ...record,
      variance: variance !== null ? parseFloat(variance.toFixed(2)) : null,
      utilization_rate: utilization_rate !== null ? parseFloat(utilization_rate.toFixed(2)) : null,
      balance: balance !== null ? parseFloat(balance.toFixed(2)) : null,
      disbursement_rate: disbursement_rate !== null ? parseFloat(disbursement_rate.toFixed(2)) : null,
    };
  }

  async findAll(query: QueryOperationDto, user?: JwtPayload): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20, sort = 'created_at', order = 'desc' } = query;
    const offset = (page - 1) * limit;

    // Validate sort column
    const sortColumn = this.ALLOWED_SORTS.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Build WHERE clause (qualified with 'uo.' to avoid JOIN ambiguity)
    const conditions: string[] = ['uo.deleted_at IS NULL'];
    const params: any[] = [];
    let paramIndex = 1;

    // Phase X: Visibility filter by role
    // Admin: sees all records. Non-admin: PUBLISHED + own records in any status.
    const queryAny = query as any;
    if (queryAny.publication_status) {
      if (queryAny.publication_status !== 'PUBLISHED' && user && !this.isAdmin(user)) {
        conditions.push(`(uo.publication_status = $${paramIndex} AND uo.created_by = $${paramIndex + 1})`);
        paramIndex += 2;
        params.push(queryAny.publication_status, user.sub);
      } else {
        conditions.push(`uo.publication_status = $${paramIndex++}`);
        params.push(queryAny.publication_status);
      }
    } else if (user && !this.isAdmin(user)) {
      // Phase Y + AM + AT: Campus-scoped visibility with junction table for assignments
      const recordCampus = this.normalizeUserCampusToRecordCampus(user.campus);
      if (recordCampus) {
        // With mapped campus: records from user's campus + own records + assigned records (via junction)
        conditions.push(`(uo.campus = $${paramIndex} OR uo.created_by = $${paramIndex + 1} OR EXISTS (SELECT 1 FROM record_assignments ra WHERE ra.module = 'OPERATIONS' AND ra.record_id = uo.id AND ra.user_id = $${paramIndex + 1}))`);
        params.push(recordCampus, user.sub);
        paramIndex += 2;
      } else {
        // Without campus (or unmapped): PUBLISHED + own records + assigned records (via junction)
        conditions.push(`(uo.publication_status = 'PUBLISHED' OR uo.created_by = $${paramIndex} OR EXISTS (SELECT 1 FROM record_assignments ra WHERE ra.module = 'OPERATIONS' AND ra.record_id = uo.id AND ra.user_id = $${paramIndex}))`);
        params.push(user.sub);
        paramIndex++;
      }
    }

    if (query.type) {
      conditions.push(`uo.operation_type = $${paramIndex++}`);
      params.push(query.type);
    }
    if (query.status) {
      conditions.push(`uo.status = $${paramIndex++}`);
      params.push(query.status);
    }
    if (query.campus) {
      conditions.push(`uo.campus = $${paramIndex++}`);
      params.push(query.campus);
    }
    if (query.coordinator_id) {
      conditions.push(`uo.coordinator_id = $${paramIndex++}`);
      params.push(query.coordinator_id);
    }
    // Phase BD: fiscal_year filter on main table
    if (query.fiscal_year) {
      conditions.push(`uo.fiscal_year = $${paramIndex++}`);
      params.push(query.fiscal_year);
    }

    const whereClause = conditions.join(' AND ');

    // Get total count (uses alias for consistency with data query)
    const countResult = await this.db.query(
      `SELECT COUNT(*) FROM university_operations uo LEFT JOIN users submitter ON uo.submitted_by = submitter.id WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Get paginated data
    const dataResult = await this.db.query(
      `SELECT uo.id, uo.operation_type, uo.title, uo.description, uo.code, uo.start_date, uo.end_date,
              uo.status, uo.budget, uo.campus, uo.coordinator_id, uo.publication_status, uo.created_at, uo.updated_at,
              uo.submitted_by, uo.submitted_at, uo.created_by,
              uo.status_q1, uo.status_q2, uo.status_q3, uo.status_q4,
              submitter.first_name || ' ' || submitter.last_name as submitted_by_name,
              (SELECT COALESCE(json_agg(json_build_object('id', u.id, 'name', u.first_name || ' ' || u.last_name)), '[]'::json)
               FROM record_assignments ra JOIN users u ON ra.user_id = u.id
               WHERE ra.module = 'OPERATIONS' AND ra.record_id = uo.id) as assigned_users
       FROM university_operations uo
       LEFT JOIN users submitter ON uo.submitted_by = submitter.id
       WHERE ${whereClause}
       ORDER BY ${sortColumn} ${sortOrder}
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset],
    );

    return createPaginatedResponse(dataResult.rows, total, page, limit);
  }

  async findOne(id: string): Promise<any> {
    const result = await this.db.query(
      `SELECT uo.*,
              creator.first_name || ' ' || creator.last_name as created_by_name,
              submitter.first_name || ' ' || submitter.last_name as submitted_by_name,
              reviewer.first_name || ' ' || reviewer.last_name as reviewed_by_name,
              (SELECT COALESCE(json_agg(json_build_object('id', u.id, 'name', u.first_name || ' ' || u.last_name)), '[]'::json)
               FROM record_assignments ra JOIN users u ON ra.user_id = u.id
               WHERE ra.module = 'OPERATIONS' AND ra.record_id = uo.id) as assigned_users
       FROM university_operations uo
       LEFT JOIN users creator ON uo.created_by = creator.id
       LEFT JOIN users submitter ON uo.submitted_by = submitter.id
       LEFT JOIN users reviewer ON uo.reviewed_by = reviewer.id
       WHERE uo.id = $1 AND uo.deleted_at IS NULL`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Operation with ID ${id} not found`);
    }

    const operation = result.rows[0];

    // Get organizational info
    const orgInfo = await this.db.query(
      `SELECT * FROM operation_organizational_info WHERE operation_id = $1 AND deleted_at IS NULL`,
      [id],
    );

    // Get indicators
    const indicators = await this.db.query(
      `SELECT * FROM operation_indicators WHERE operation_id = $1 AND deleted_at IS NULL ORDER BY fiscal_year DESC`,
      [id],
    );

    // Get financials
    const financials = await this.db.query(
      `SELECT * FROM operation_financials WHERE operation_id = $1 AND deleted_at IS NULL ORDER BY fiscal_year DESC, quarter`,
      [id],
    );

    return {
      ...operation,
      organizational_info: orgInfo.rows[0] || null,
      indicators: indicators.rows,
      financials: financials.rows,
    };
  }

  async create(dto: CreateOperationDto, userId: string, user?: JwtPayload): Promise<any> {
    // Check for duplicate code
    if (dto.code) {
      const existing = await this.db.query(
        `SELECT id FROM university_operations WHERE code = $1 AND deleted_at IS NULL`,
        [dto.code],
      );
      if (existing.rows.length > 0) {
        throw new ConflictException(`Operation code ${dto.code} already exists`);
      }
    }

    // Universal Draft Governance: ALL users create DRAFT
    // Publishing requires explicit approval action via POST /:id/publish endpoint
    const publicationStatus: PublicationStatus = 'DRAFT';
    const submittedBy = userId;  // Always track submitter for audit trail
    const submittedAt = new Date();  // Always track submission time

    // Phase AN: Include assigned_to for inline assignment during creation
    // Phase BD: Include fiscal_year for year-based filtering
    const result = await this.db.query(
      `INSERT INTO university_operations
       (operation_type, title, description, code, start_date, end_date, status, budget, campus, coordinator_id, metadata, created_by,
        publication_status, submitted_by, submitted_at, assigned_to, fiscal_year)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [
        dto.operation_type,
        dto.title,
        dto.description,
        dto.code,
        dto.start_date,
        dto.end_date,
        dto.status,
        dto.budget,
        dto.campus,
        dto.coordinator_id,
        dto.metadata ? JSON.stringify(dto.metadata) : null,
        userId,
        publicationStatus,
        submittedBy,
        submittedAt,
        dto.assigned_to || null,
        dto.fiscal_year || null,
      ],
    );

    // Phase AT: Handle multi-select assignments via junction table
    const recordId = result.rows[0].id;
    if (dto.assigned_user_ids && dto.assigned_user_ids.length > 0) {
      await this.updateRecordAssignments(recordId, dto.assigned_user_ids);
    } else if (dto.assigned_to) {
      // Backward compatibility: single assigned_to also creates junction entry
      await this.updateRecordAssignments(recordId, [dto.assigned_to]);
    }

    this.logger.log(`OPERATION_CREATED: id=${recordId}, status=${publicationStatus}, by=${userId}`);
    return result.rows[0];
  }

  async update(id: string, dto: UpdateOperationDto, userId: string, user?: JwtPayload): Promise<any> {
    // Get current record to check publication_status and ownership
    const currentRecord = await this.findOne(id);

    // Phase AC + AT: Ownership Check — Non-admin users can edit if creator OR assigned (via junction table)
    if (user && !this.permissionResolver.isAdmin(user)) {
      const isOwner = currentRecord.created_by === userId;
      const isAssigned = await this.isUserAssigned(id, userId);
      if (!isOwner && !isAssigned) {
        throw new ForbiddenException('Cannot edit records you do not own or are not assigned to');
      }
    }

    // Check for duplicate code if updating
    const dtoAny = dto as any;
    if (dtoAny.code) {
      const existing = await this.db.query(
        `SELECT id FROM university_operations WHERE code = $1 AND id != $2 AND deleted_at IS NULL`,
        [dtoAny.code, id],
      );
      if (existing.rows.length > 0) {
        throw new ConflictException(`Operation code ${dtoAny.code} already exists`);
      }
    }

    // Phase E: State Machine Lockdown
    // Direct publication_status changes via PATCH are not allowed
    // Users must use workflow endpoints: /submit-for-review, /publish, /reject
    if (dtoAny.publication_status) {
      throw new BadRequestException(
        'Cannot change publication_status via update. ' +
        'Use POST /:id/submit-for-review (DRAFT → PENDING_REVIEW), ' +
        'POST /:id/publish (PENDING_REVIEW → PUBLISHED), or ' +
        'POST /:id/reject (PENDING_REVIEW → REJECTED).'
      );
    }

    // Phase V/W: Deterministic State Machine — edit reverts any non-DRAFT status to DRAFT
    // PUBLISHED      → DRAFT (revoke approval, clear reviewed metadata)
    // REJECTED       → DRAFT (clear rejection, enable resubmission)
    // PENDING_REVIEW → DRAFT (cancel submission, clear submitted metadata)
    const priorStatus = currentRecord.publication_status;
    const requiresStatusReset = ['PUBLISHED', 'REJECTED', 'PENDING_REVIEW'].includes(priorStatus);
    if (requiresStatusReset) {
      this.logger.log(`STATUS_REVERTED: id=${id}, by=${userId}, was=${priorStatus}, now=DRAFT`);
    }

    // Build dynamic SET clause
    const fields = Object.keys(dto).filter((k) => dto[k] !== undefined && k !== 'assigned_user_ids');
    if (fields.length === 0) {
      return this.findOne(id);
    }

    let setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values: any[] = fields.map((f) => (f === 'metadata' ? JSON.stringify(dto[f]) : dto[f]));

    // Apply status reset fields based on prior status
    if (requiresStatusReset) {
      let resetFields: string[];
      if (priorStatus === 'PENDING_REVIEW') {
        resetFields = [
          `publication_status = 'DRAFT'`,
          `submitted_by = NULL`,
          `submitted_at = NULL`,
        ];
      } else {
        const nextIdx = fields.length + 1;
        resetFields = [
          `publication_status = 'DRAFT'`,
          `reviewed_by = NULL`,
          `reviewed_at = NULL`,
          `review_notes = NULL`,
          `submitted_by = $${nextIdx}`,
          `submitted_at = NOW()`,
        ];
        values.push(userId);
      }
      setClause = setClause ? `${setClause}, ${resetFields.join(', ')}` : resetFields.join(', ');
    }

    const result = await this.db.query(
      `UPDATE university_operations
       SET ${setClause}, updated_by = $${values.length + 1}, updated_at = NOW()
       WHERE id = $${values.length + 2} AND deleted_at IS NULL
       RETURNING *`,
      [...values, userId, id],
    );

    // Phase AT: Handle multi-select assignments via junction table
    if (dto.assigned_user_ids !== undefined) {
      await this.updateRecordAssignments(id, dto.assigned_user_ids || []);
    }

    this.logger.log(`OPERATION_UPDATED: id=${id}, by=${userId}, fields=[${fields.join(',')}]${requiresStatusReset ? `, status_reset=DRAFT (was=${priorStatus})` : ''}`);
    return this.findOne(id);  // Return fresh data with assigned_users
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id);

    await this.db.query(
      `UPDATE university_operations SET deleted_at = NOW(), deleted_by = $1 WHERE id = $2`,
      [userId, id],
    );

    this.logger.log(`OPERATION_DELETED: id=${id}, by=${userId}`);
  }

  // --- Draft Governance Workflow ---

  async submitForReview(id: string, userId: string): Promise<any> {
    const operation = await this.findOne(id);

    if (operation.publication_status !== 'DRAFT' && operation.publication_status !== 'REJECTED') {
      throw new BadRequestException(
        `Only DRAFT or REJECTED records can be submitted for review. Current status: ${operation.publication_status}`,
      );
    }

    // Phase BW: Creator OR assigned user (via junction table) can submit for review
    const isOwner = operation.created_by === userId;
    const isAssigned = await this.isUserAssigned(id, userId);
    if (!isOwner && !isAssigned) {
      throw new ForbiddenException('Only the creator or assigned user can submit this draft for review');
    }

    const result = await this.db.query(
      `UPDATE university_operations
       SET publication_status = 'PENDING_REVIEW',
           submitted_by = $1,
           submitted_at = NOW(),
           review_notes = NULL,
           updated_at = NOW()
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [userId, id],
    );

    this.logger.log(`OPERATION_SUBMITTED_FOR_REVIEW: id=${id}, by=${userId}`);
    return result.rows[0];
  }

  async publish(id: string, adminId: string, user: JwtPayload): Promise<any> {
    if (!this.permissionResolver.isAdmin(user)) {
      throw new ForbiddenException('Only Admin can publish records');
    }

    const operation = await this.findOne(id);

    // Centralized rank-based approval check (includes self-approval prevention)
    const approvalCheck = await this.permissionResolver.canApproveByRank(
      adminId,
      operation.created_by,
      user.is_superadmin,
    );
    if (!approvalCheck.allowed) {
      throw new ForbiddenException(approvalCheck.reason);
    }

    // Universal Draft Governance: Only PENDING_REVIEW records can be published
    // DRAFT must first be submitted for review via POST /:id/submit-for-review
    if (operation.publication_status !== 'PENDING_REVIEW') {
      throw new BadRequestException(
        `Only PENDING_REVIEW records can be published. Current status: ${operation.publication_status}. ` +
        `DRAFT records must first be submitted for review via POST /:id/submit-for-review.`
      );
    }

    const result = await this.db.query(
      `UPDATE university_operations
       SET publication_status = 'PUBLISHED',
           reviewed_by = $1,
           reviewed_at = NOW(),
           review_notes = NULL,
           updated_at = NOW()
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [adminId, id],
    );

    this.logger.log(`OPERATION_PUBLISHED: id=${id}, by=${adminId}`);
    return result.rows[0];
  }

  async reject(id: string, adminId: string, notes: string, user: JwtPayload): Promise<any> {
    if (!this.isAdmin(user)) {
      throw new ForbiddenException('Only Admin can reject records');
    }

    const operation = await this.findOne(id);

    if (operation.publication_status !== 'PENDING_REVIEW') {
      throw new BadRequestException(
        `Only PENDING_REVIEW records can be rejected. Current status: ${operation.publication_status}`,
      );
    }

    if (!notes || notes.trim().length === 0) {
      throw new BadRequestException('Rejection notes are required');
    }

    const result = await this.db.query(
      `UPDATE university_operations
       SET publication_status = 'REJECTED',
           reviewed_by = $1,
           reviewed_at = NOW(),
           review_notes = $2,
           updated_at = NOW()
       WHERE id = $3 AND deleted_at IS NULL
       RETURNING *`,
      [adminId, notes.trim(), id],
    );

    this.logger.log(`OPERATION_REJECTED: id=${id}, by=${adminId}`);
    return result.rows[0];
  }

  /**
   * Withdraw a pending submission (return to DRAFT)
   * Only the original submitter can withdraw their own submission
   */
  async withdraw(id: string, userId: string): Promise<any> {
    const operation = await this.findOne(id);

    // Can only withdraw PENDING_REVIEW records
    if (operation.publication_status !== 'PENDING_REVIEW') {
      throw new BadRequestException(
        `Only PENDING_REVIEW records can be withdrawn. Current status: ${operation.publication_status}`,
      );
    }

    // Only the original submitter can withdraw
    if (operation.submitted_by !== userId) {
      throw new ForbiddenException('Only the original submitter can withdraw this submission');
    }

    const result = await this.db.query(
      `UPDATE university_operations
       SET publication_status = 'DRAFT',
           submitted_by = NULL,
           submitted_at = NULL,
           updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id],
    );

    this.logger.log(`OPERATION_WITHDRAWN: id=${id}, by=${userId}`);
    return result.rows[0];
  }

  // ─── Phase DY-C: Per-Quarter Submission Workflow ───────────────────────────────

  /**
   * Phase DY-C: Submit a single quarter for review
   */
  async submitQuarterForReview(id: string, quarter: string, userId: string): Promise<any> {
    this.validateQuarterParam(quarter);
    const operation = await this.findOne(id);
    const statusCol = `status_${quarter.toLowerCase()}`;
    const currentStatus = operation[statusCol] || 'DRAFT';

    if (currentStatus !== 'DRAFT' && currentStatus !== 'REJECTED') {
      throw new BadRequestException(
        `${quarter} can only be submitted from DRAFT or REJECTED status. Current: ${currentStatus}`,
      );
    }

    const result = await this.db.query(
      `UPDATE university_operations
       SET ${statusCol} = 'PENDING_REVIEW', updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id],
    );

    this.logger.log(`QUARTER_SUBMITTED: id=${id}, quarter=${quarter}, by=${userId}`);
    return result.rows[0];
  }

  /**
   * Phase DY-C: Approve a single quarter (Admin only)
   */
  async approveQuarter(id: string, quarter: string, adminId: string, user: JwtPayload): Promise<any> {
    this.validateQuarterParam(quarter);
    if (!this.isAdmin(user)) throw new ForbiddenException('Only Admin can approve quarters');
    const operation = await this.findOne(id);

    // Prevent self-approval
    if (operation.created_by === adminId) {
      throw new ForbiddenException('Cannot approve your own submission');
    }

    const statusCol = `status_${quarter.toLowerCase()}`;
    const currentStatus = operation[statusCol] || 'DRAFT';
    if (currentStatus !== 'PENDING_REVIEW') {
      throw new BadRequestException(
        `${quarter} can only be approved from PENDING_REVIEW status. Current: ${currentStatus}`,
      );
    }

    const result = await this.db.query(
      `UPDATE university_operations
       SET ${statusCol} = 'PUBLISHED', updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id],
    );

    this.logger.log(`QUARTER_APPROVED: id=${id}, quarter=${quarter}, by=${adminId}`);
    return result.rows[0];
  }

  /**
   * Phase DY-C: Reject a single quarter (Admin only)
   */
  async rejectQuarter(id: string, quarter: string, adminId: string, notes: string, user: JwtPayload): Promise<any> {
    this.validateQuarterParam(quarter);
    if (!this.isAdmin(user)) throw new ForbiddenException('Only Admin can reject quarters');

    const operation = await this.findOne(id);
    const statusCol = `status_${quarter.toLowerCase()}`;
    const currentStatus = operation[statusCol] || 'DRAFT';
    if (currentStatus !== 'PENDING_REVIEW') {
      throw new BadRequestException(
        `${quarter} can only be rejected from PENDING_REVIEW status. Current: ${currentStatus}`,
      );
    }

    const result = await this.db.query(
      `UPDATE university_operations
       SET ${statusCol} = 'REJECTED', review_notes = $2, updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id, notes || ''],
    );

    this.logger.log(`QUARTER_REJECTED: id=${id}, quarter=${quarter}, by=${adminId}`);
    return result.rows[0];
  }

  /**
   * Phase DY-C: Withdraw a quarter submission
   */
  async withdrawQuarter(id: string, quarter: string, userId: string): Promise<any> {
    this.validateQuarterParam(quarter);
    const operation = await this.findOne(id);
    const statusCol = `status_${quarter.toLowerCase()}`;
    const currentStatus = operation[statusCol] || 'DRAFT';
    if (currentStatus !== 'PENDING_REVIEW') {
      throw new BadRequestException(
        `${quarter} can only be withdrawn from PENDING_REVIEW status. Current: ${currentStatus}`,
      );
    }

    const result = await this.db.query(
      `UPDATE university_operations
       SET ${statusCol} = 'DRAFT', updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id],
    );

    this.logger.log(`QUARTER_WITHDRAWN: id=${id}, quarter=${quarter}, by=${userId}`);
    return result.rows[0];
  }

  private validateQuarterParam(quarter: string): void {
    if (!['Q1', 'Q2', 'Q3', 'Q4'].includes(quarter)) {
      throw new BadRequestException(`Invalid quarter: ${quarter}. Must be Q1, Q2, Q3, or Q4.`);
    }
  }

  /**
   * Get drafts pending review (Admin dashboard)
   * Filtered by admin's module assignments
   */
  async findPendingReview(user: JwtPayload): Promise<any[]> {
    if (!this.isAdmin(user)) {
      throw new ForbiddenException('Only Admin can view pending reviews');
    }

    // Check module access (SuperAdmin or user with OPERATIONS/ALL assignment)
    if (!user.is_superadmin) {
      const accessCheck = await this.db.query(
        `SELECT 1 FROM user_module_assignments
         WHERE user_id = $1
           AND (module = 'OPERATIONS' OR module = 'ALL')`,
        [user.sub],
      );

      if (accessCheck.rows.length === 0) {
        return []; // No access to this module
      }
    }

    const result = await this.db.query(
      `SELECT uo.id, uo.code, uo.title, uo.campus, uo.publication_status,
              uo.submitted_by, uo.submitted_at, uo.created_at,
              u.first_name || ' ' || u.last_name as submitter_name
       FROM university_operations uo
       LEFT JOIN users u ON uo.submitted_by = u.id
       WHERE uo.publication_status = 'PENDING_REVIEW'
         AND uo.deleted_at IS NULL
       ORDER BY uo.submitted_at ASC`,
    );

    return result.rows;
  }

  async findMyDrafts(userId: string): Promise<any[]> {
    const result = await this.db.query(
      `SELECT id, code, title, campus, publication_status,
              submitted_at, review_notes, created_at
       FROM university_operations
       WHERE created_by = $1
         AND publication_status IN ('DRAFT', 'PENDING_REVIEW', 'REJECTED')
         AND deleted_at IS NULL
       ORDER BY created_at DESC`,
      [userId],
    );

    return result.rows;
  }

  // --- Indicators ---

  /**
   * Phase CT: Fetch fixed indicator taxonomy for an operation's pillar type
   * Returns the 3 seeded indicators for the operation's pillar (e.g., HIGHER_EDUCATION)
   */
  async findIndicatorTaxonomy(operationId: string): Promise<any[]> {
    const operation = await this.findOne(operationId);

    const result = await this.db.query(
      `SELECT id, pillar_type, indicator_name, indicator_code, uacs_code,
              indicator_order, indicator_type, unit_type, description
       FROM pillar_indicator_taxonomy
       WHERE pillar_type = $1 AND is_active = true
       ORDER BY indicator_order ASC`,
      [operation.operation_type],
    );

    return result.rows;
  }

  /**
   * Phase CX-B: Fetch taxonomy directly by pillar type (no operation ID needed)
   * Used by the main pillar-based interface
   */
  async findTaxonomyByPillarType(pillarType: string): Promise<any[]> {
    const validPillarTypes = ['HIGHER_EDUCATION', 'ADVANCED_EDUCATION', 'RESEARCH', 'TECHNICAL_ADVISORY'];
    if (!validPillarTypes.includes(pillarType)) {
      return [];
    }

    const result = await this.db.query(
      `SELECT id, pillar_type, indicator_name, indicator_code, uacs_code,
              indicator_order, indicator_type, unit_type, description
       FROM pillar_indicator_taxonomy
       WHERE pillar_type = $1 AND is_active = true
       ORDER BY indicator_type ASC, indicator_order ASC`,
      [pillarType],
    );

    return result.rows;
  }

  /**
   * Phase CX-B: Fetch all indicators by pillar type and fiscal year (cross-operation)
   * Aggregates indicator data across all operations of the same pillar type
   * Phase DK-B: Uses LEFT JOIN to include orphaned indicators (pillar_indicator_id = NULL)
   */
  async findIndicatorsByPillarAndYear(pillarType: string, fiscalYear: number, quarter?: string): Promise<any[]> {
    // Phase DJ-B: Debug logging for progress malfunction diagnosis
    this.logger.debug(
      `[findIndicatorsByPillarAndYear] pillar_type=${pillarType} (${typeof pillarType}), fiscal_year=${fiscalYear} (${typeof fiscalYear}), quarter=${quarter}`,
    );

    const validPillarTypes = ['HIGHER_EDUCATION', 'ADVANCED_EDUCATION', 'RESEARCH', 'TECHNICAL_ADVISORY'];
    if (!validPillarTypes.includes(pillarType)) {
      this.logger.debug(`[findIndicatorsByPillarAndYear] Invalid pillar_type: ${pillarType}`);
      return [];
    }

    // Phase DY-C: Filter by reported_quarter when provided
    const params: any[] = [pillarType, fiscalYear];
    let quarterFilter = '';
    if (quarter && ['Q1', 'Q2', 'Q3', 'Q4'].includes(quarter)) {
      quarterFilter = ` AND (oi.reported_quarter = $3 OR oi.reported_quarter IS NULL)`;
      params.push(quarter);
    }

    // Phase DK-B: Use LEFT JOIN to include orphaned indicators
    const result = await this.db.query(
      `SELECT
        oi.*,
        pit.indicator_name,
        pit.indicator_code,
        pit.uacs_code,
        pit.unit_type,
        pit.indicator_type,
        pit.description
       FROM operation_indicators oi
       LEFT JOIN pillar_indicator_taxonomy pit ON oi.pillar_indicator_id = pit.id
       JOIN university_operations uo ON oi.operation_id = uo.id
       WHERE uo.operation_type = $1
         AND (pit.pillar_type = $1 OR pit.pillar_type IS NULL)
         AND oi.fiscal_year = $2
         AND oi.deleted_at IS NULL
         AND uo.deleted_at IS NULL${quarterFilter}
       ORDER BY COALESCE(pit.indicator_order, 999) ASC, oi.particular ASC`,
      params,
    );

    // Phase DK-B: Log orphan count for admin awareness
    const orphanCount = result.rows.filter((r) => !r.pillar_indicator_id).length;
    if (orphanCount > 0) {
      this.logger.warn(
        `[findIndicatorsByPillarAndYear] Found ${orphanCount} orphaned indicators for ${pillarType} FY${fiscalYear}`,
      );
    }

    this.logger.debug(
      `[findIndicatorsByPillarAndYear] Returned ${result.rows.length} indicators (${orphanCount} orphaned) for ${pillarType} FY${fiscalYear}`,
    );

    return result.rows.map((row) => this.computeIndicatorMetrics(row));
  }

  /**
   * Phase CT: Fetch indicators with taxonomy metadata joined
   * Returns indicator data with pillar_indicator_taxonomy fields (indicator_name, uacs_code, etc.)
   */
  async findIndicators(operationId: string, fiscalYear?: number): Promise<any[]> {
    await this.findOne(operationId);

    let query = `
      SELECT
        oi.*,
        pit.indicator_name as taxonomy_name,
        pit.indicator_code as taxonomy_code,
        pit.uacs_code as taxonomy_uacs,
        pit.unit_type,
        pit.description as taxonomy_description
      FROM operation_indicators oi
      LEFT JOIN pillar_indicator_taxonomy pit ON oi.pillar_indicator_id = pit.id
      WHERE oi.operation_id = $1 AND oi.deleted_at IS NULL
    `;
    const params: any[] = [operationId];

    if (fiscalYear) {
      query += ` AND oi.fiscal_year = $2`;
      params.push(fiscalYear);
    }

    query += ` ORDER BY COALESCE(pit.indicator_order, 999) ASC, oi.fiscal_year DESC, oi.created_at DESC`;

    const result = await this.db.query(query, params);
    return result.rows.map((row) => this.computeIndicatorMetrics(row));
  }

  /**
   * Phase CT + DN-A + DT: Compute indicator metrics (variance, accomplishment rate)
   * Called on read to ensure computed values are always accurate
   *
   * Phase DN-A: Unit-type-aware aggregation
   * - PERCENTAGE: use AVERAGE (quarterly rates should be averaged)
   * - COUNT/WEIGHTED_COUNT: use SUM (cumulative totals per BAR1 standard)
   *
   * Phase DT-A: PostgreSQL DECIMAL/NUMERIC columns are returned as strings
   * by node-postgres to preserve precision. All values must be converted
   * to numbers before arithmetic operations.
   */
  private computeIndicatorMetrics(record: any): any {
    // Phase DT-A: Convert PostgreSQL DECIMAL strings to numbers
    // node-postgres returns DECIMAL/NUMERIC columns as strings to preserve precision
    const toNumber = (v: any): number | null => {
      if (v === null || v === undefined) return null;
      const num = typeof v === 'string' ? parseFloat(v) : Number(v);
      return isNaN(num) ? null : num;
    };

    // Phase DT-B: Safe formatting helper - prevents TypeError on non-numbers
    const formatDecimal = (v: number | null, decimals: number): number | null => {
      if (v === null || typeof v !== 'number' || isNaN(v)) return null;
      return parseFloat(v.toFixed(decimals));
    };

    // Extract and convert quarterly values (null-safe, type-safe)
    const targets = [
      toNumber(record.target_q1),
      toNumber(record.target_q2),
      toNumber(record.target_q3),
      toNumber(record.target_q4),
    ].filter((v): v is number => v !== null);

    const accomplishments = [
      toNumber(record.accomplishment_q1),
      toNumber(record.accomplishment_q2),
      toNumber(record.accomplishment_q3),
      toNumber(record.accomplishment_q4),
    ].filter((v): v is number => v !== null);

    // Phase DO-A: BAR1 Standard — ALL indicator types use SUM aggregation
    // Total = sum of all quarterly values (Q1 + Q2 + Q3 + Q4)
    // Now safe: targets and accomplishments are guaranteed number[]
    const totalTarget = targets.length > 0
      ? targets.reduce((a, b) => a + b, 0)
      : null;

    const totalAccomplishment = accomplishments.length > 0
      ? accomplishments.reduce((a, b) => a + b, 0)
      : null;

    // Phase DT-D: Variance with safe bounds
    // DECIMAL(10,4) max is 999999.9999
    const MAX_VARIANCE = 999999.9999;
    const MIN_VARIANCE = -999999.9999;
    let variance: number | null = null;
    if (totalTarget !== null && totalAccomplishment !== null) {
      const rawVariance = totalAccomplishment - totalTarget;
      variance = Math.max(MIN_VARIANCE, Math.min(rawVariance, MAX_VARIANCE));
    }

    // Phase DT-C: Accomplishment rate with safe bounds
    // Cap at 9999.99% to prevent numeric overflow in edge cases
    const MAX_RATE = 9999.99;
    let accomplishmentRate: number | null = null;
    if (totalTarget !== null && totalTarget !== 0 && totalAccomplishment !== null) {
      const rawRate = (totalAccomplishment / totalTarget) * 100;
      accomplishmentRate = Math.min(rawRate, MAX_RATE);
    }

    return {
      ...record,
      // Phase DO-A: BAR1 Standard — all values computed via SUM
      total_target: formatDecimal(totalTarget, 4),
      total_accomplishment: formatDecimal(totalAccomplishment, 4),
      // Backward compat aliases (contain SUM values, not averages)
      average_target: formatDecimal(totalTarget, 4),
      average_accomplishment: formatDecimal(totalAccomplishment, 4),
      variance: formatDecimal(variance, 4),
      accomplishment_rate: formatDecimal(accomplishmentRate, 2),
    };
  }

  /**
   * Phase CT: Create quarterly indicator data linked to fixed taxonomy
   * This enforces the pillar-based model where indicator metadata comes from taxonomy
   */
  async createIndicatorQuarterlyData(
    operationId: string,
    dto: CreateIndicatorQuarterlyDto,
    userId: string,
    user: JwtPayload,
  ): Promise<any> {
    // Phase CM: Ownership validation
    await this.validateOperationOwnership(operationId, userId, user);
    // Phase CO: Publication status lock
    await this.validateOperationEditable(operationId, dto.reported_quarter, user);

    // Verify pillar_indicator_id exists and matches operation's pillar type
    const operation = await this.findOne(operationId);
    const taxonomyCheck = await this.db.query(
      `SELECT id, pillar_type, indicator_name
       FROM pillar_indicator_taxonomy
       WHERE id = $1 AND is_active = true`,
      [dto.pillar_indicator_id],
    );

    if (taxonomyCheck.rowCount === 0) {
      throw new BadRequestException('Invalid pillar_indicator_id: Indicator not found in taxonomy');
    }

    const taxonomy = taxonomyCheck.rows[0];
    if (taxonomy.pillar_type !== operation.operation_type) {
      throw new BadRequestException(
        `Indicator taxonomy mismatch: Indicator belongs to ${taxonomy.pillar_type}, but operation is ${operation.operation_type}`,
      );
    }

    // Check if quarterly data already exists for this indicator + fiscal year + quarter
    // Phase DY-C: Include reported_quarter in duplicate check when provided
    const existingCheckParams: any[] = [dto.pillar_indicator_id, operationId, dto.fiscal_year];
    let existingCheckQuery = `SELECT id FROM operation_indicators
       WHERE pillar_indicator_id = $1 AND operation_id = $2 AND fiscal_year = $3 AND deleted_at IS NULL`;
    if (dto.reported_quarter) {
      existingCheckQuery += ` AND reported_quarter = $4`;
      existingCheckParams.push(dto.reported_quarter);
    } else {
      existingCheckQuery += ` AND reported_quarter IS NULL`;
    }
    const existingCheck = await this.db.query(existingCheckQuery, existingCheckParams);

    if (existingCheck.rowCount > 0) {
      throw new ConflictException(
        `Quarterly data already exists for indicator "${taxonomy.indicator_name}" in fiscal year ${dto.fiscal_year}. Use PATCH to update.`,
      );
    }

    // Phase DY-C: Include reported_quarter in INSERT
    const result = await this.db.query(
      `INSERT INTO operation_indicators
       (operation_id, pillar_indicator_id, particular, fiscal_year, reported_quarter,
        target_q1, target_q2, target_q3, target_q4,
        accomplishment_q1, accomplishment_q2, accomplishment_q3, accomplishment_q4,
        score_q1, score_q2, score_q3, score_q4,
        remarks, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
       RETURNING *`,
      [
        operationId,
        dto.pillar_indicator_id,
        taxonomy.indicator_name, // Auto-derived from pillar_indicator_taxonomy
        dto.fiscal_year,
        dto.reported_quarter || null,
        dto.target_q1,
        dto.target_q2,
        dto.target_q3,
        dto.target_q4,
        dto.accomplishment_q1,
        dto.accomplishment_q2,
        dto.accomplishment_q3,
        dto.accomplishment_q4,
        dto.score_q1,
        dto.score_q2,
        dto.score_q3,
        dto.score_q4,
        dto.remarks,
        userId,
      ],
    );

    this.logger.log(
      `INDICATOR_QUARTERLY_CREATED: id=${result.rows[0].id}, taxonomy=${dto.pillar_indicator_id}, operation=${operationId}, by=${userId}`,
    );

    // Phase GOV-C: Auto-revert quarterly report to DRAFT when indicator data changes
    await this.autoRevertQuarterlyReport(dto.fiscal_year, dto.reported_quarter, userId);

    return this.computeIndicatorMetrics(result.rows[0]);
  }

  /**
   * Phase DJ-A: Update quarterly indicator data with full validation
   * Enforces fiscal_year scope, taxonomy validation, and pillar type match
   * Unlike the generic updateIndicator, this validates quarterly-specific constraints
   */
  async updateIndicatorQuarterlyData(
    operationId: string,
    indicatorId: string,
    dto: Partial<CreateIndicatorQuarterlyDto>,
    userId: string,
    user: JwtPayload,
  ): Promise<any> {
    // Phase DL-A: Entry logging for diagnostic purposes
    this.logger.log(
      `[PATCH /indicators/quarterly] ENTRY: operationId=${operationId}, indicatorId=${indicatorId}, payload.fiscal_year=${dto.fiscal_year || 'not provided'}, userId=${userId}`,
    );

    // Ownership and publication status validation
    await this.validateOperationOwnership(operationId, userId, user);
    await this.validateOperationEditable(operationId, dto.reported_quarter, user);

    // Phase DK-A: Use LEFT JOIN to include orphaned indicators (pillar_indicator_id = NULL)
    const check = await this.db.query(
      `SELECT oi.id, oi.fiscal_year, oi.pillar_indicator_id, oi.operation_id, oi.particular,
              pit.pillar_type, pit.indicator_name, uo.operation_type
       FROM operation_indicators oi
       LEFT JOIN pillar_indicator_taxonomy pit ON oi.pillar_indicator_id = pit.id
       JOIN university_operations uo ON oi.operation_id = uo.id
       WHERE oi.id = $1 AND oi.operation_id = $2 AND oi.deleted_at IS NULL`,
      [indicatorId, operationId],
    );

    // Phase DL-A: Diagnostic logging for lookup result
    this.logger.log(
      `[PATCH /indicators/quarterly] LOOKUP RESULT: found=${check.rows.length > 0}, rowCount=${check.rows.length}`,
    );

    if (check.rows.length > 0) {
      const found = check.rows[0];
      this.logger.log(
        `[PATCH /indicators/quarterly] FOUND INDICATOR: id=${found.id}, operation_id=${found.operation_id}, fiscal_year=${found.fiscal_year}, pillar_indicator_id=${found.pillar_indicator_id || 'NULL (orphan)'}`,
      );
    } else {
      // Phase DL-A: Enhanced 404 diagnostic logging
      this.logger.error(
        `[PATCH /indicators/quarterly] 404 TRIGGERED: Indicator ${indicatorId} not found in operation ${operationId}`,
      );

      // Log all indicators for this operation
      const allIndicators = await this.db.query(
        `SELECT id, pillar_indicator_id, fiscal_year, operation_id, particular 
         FROM operation_indicators 
         WHERE operation_id = $1 AND deleted_at IS NULL 
         LIMIT 10`,
        [operationId],
      );
      this.logger.error(
        `[PATCH /indicators/quarterly] Available indicators in operation ${operationId}: ${JSON.stringify(
          allIndicators.rows.map((r) => ({
            id: r.id,
            fiscal_year: r.fiscal_year,
            particular: r.particular,
          })),
        )}`,
      );

      // Check if indicator exists in OTHER operations
      const otherOps = await this.db.query(
        `SELECT id, operation_id, fiscal_year, particular 
         FROM operation_indicators 
         WHERE id = $1 AND deleted_at IS NULL`,
        [indicatorId],
      );
      if (otherOps.rows.length > 0) {
        this.logger.error(
          `[PATCH /indicators/quarterly] MISMATCH CONFIRMED: Indicator ${indicatorId} belongs to operation ${otherOps.rows[0].operation_id} (FY ${otherOps.rows[0].fiscal_year}), but PATCH was sent to operation ${operationId}`,
        );
      } else {
        this.logger.error(
          `[PATCH /indicators/quarterly] Indicator ${indicatorId} does NOT exist in database (deleted or invalid UUID)`,
        );
      }
    }

    if (check.rows.length === 0) {
      throw new NotFoundException(
        `Indicator ${indicatorId} not found in operation ${operationId}`,
      );
    }

    const indicator = check.rows[0];

    // Phase DK-A: Handle orphaned indicators (pillar_indicator_id = NULL)
    if (!indicator.pillar_indicator_id) {
      this.logger.warn(
        `[updateIndicatorQuarterlyData] Orphaned indicator detected: id=${indicatorId}, particular="${indicator.particular}"`,
      );
      // Allow update but skip pillar type validation for orphans
    } else {
      // Validate pillar type match only for linked indicators
      if (indicator.pillar_type !== indicator.operation_type) {
        this.logger.warn(
          `[updateIndicatorQuarterlyData] Pillar type mismatch: indicator pillar=${indicator.pillar_type}, operation type=${indicator.operation_type}`,
        );
      }
    }

    // Prevent fiscal_year changes (must create new record instead)
    if (dto.fiscal_year && dto.fiscal_year !== indicator.fiscal_year) {
      throw new BadRequestException(
        `Cannot change fiscal year from ${indicator.fiscal_year} to ${dto.fiscal_year}. Create new record for different year.`,
      );
    }

    // Prevent pillar_indicator_id changes only for linked indicators
    if (dto.pillar_indicator_id && indicator.pillar_indicator_id) {
      if (dto.pillar_indicator_id !== indicator.pillar_indicator_id) {
        const taxonomyCheck = await this.db.query(
          `SELECT pillar_type FROM pillar_indicator_taxonomy WHERE id = $1 AND is_active = true`,
          [dto.pillar_indicator_id],
        );
        if (taxonomyCheck.rowCount === 0) {
          throw new BadRequestException('Invalid pillar_indicator_id: not found in taxonomy');
        }
        if (taxonomyCheck.rows[0].pillar_type !== indicator.pillar_type) {
          throw new BadRequestException(
            `Cannot change indicator to different pillar type (current: ${indicator.pillar_type}, new: ${taxonomyCheck.rows[0].pillar_type})`,
          );
        }
      }
    }

    // Perform dynamic field update (same logic as generic updateIndicator, excluding pillar_indicator_id)
    const fields = Object.keys(dto).filter((k) => dto[k] !== undefined && k !== 'pillar_indicator_id');
    if (fields.length === 0) {
      // No changes, return current state with metrics
      // Phase DK-A: Use LEFT JOIN for orphan compatibility
      const current = await this.db.query(
        `SELECT oi.*, pit.indicator_name, pit.indicator_code, pit.uacs_code, pit.unit_type
         FROM operation_indicators oi
         LEFT JOIN pillar_indicator_taxonomy pit ON oi.pillar_indicator_id = pit.id
         WHERE oi.id = $1`,
        [indicatorId],
      );
      return this.computeIndicatorMetrics(current.rows[0]);
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map((f) => dto[f]);

    const result = await this.db.query(
      `UPDATE operation_indicators
       SET ${setClause}, updated_by = $${fields.length + 1}, updated_at = NOW()
       WHERE id = $${fields.length + 2}
       RETURNING *`,
      [...values, userId, indicatorId],
    );

    this.logger.log(
      `INDICATOR_QUARTERLY_UPDATED: id=${indicatorId}, operation=${operationId}, fiscal_year=${indicator.fiscal_year}, orphan=${!indicator.pillar_indicator_id}, by=${userId}`,
    );

    // Phase GOV-C: Auto-revert quarterly report to DRAFT when indicator data changes
    await this.autoRevertQuarterlyReport(indicator.fiscal_year, dto.reported_quarter, userId);

    // Phase DK-A: Use LEFT JOIN for orphan compatibility
    const enriched = await this.db.query(
      `SELECT oi.*, pit.indicator_name, pit.indicator_code, pit.uacs_code, pit.unit_type
       FROM operation_indicators oi
       LEFT JOIN pillar_indicator_taxonomy pit ON oi.pillar_indicator_id = pit.id
       WHERE oi.id = $1`,
      [indicatorId],
    );

    return this.computeIndicatorMetrics(enriched.rows[0]);
  }

  async createIndicator(operationId: string, dto: CreateIndicatorDto, userId: string, user: JwtPayload): Promise<any> {
    // Phase CM: Ownership validation
    await this.validateOperationOwnership(operationId, userId, user);
    // Phase CO: Publication status lock
    await this.validateOperationEditable(operationId, undefined, user);

    const result = await this.db.query(
      `INSERT INTO operation_indicators
       (operation_id, particular, description, indicator_code, uacs_code, fiscal_year,
        target_q1, target_q2, target_q3, target_q4,
        accomplishment_q1, accomplishment_q2, accomplishment_q3, accomplishment_q4,
        remarks, metadata, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [
        operationId,
        dto.particular,
        dto.description,
        dto.indicator_code,
        dto.uacs_code,
        dto.fiscal_year,
        dto.target_q1,
        dto.target_q2,
        dto.target_q3,
        dto.target_q4,
        dto.accomplishment_q1,
        dto.accomplishment_q2,
        dto.accomplishment_q3,
        dto.accomplishment_q4,
        dto.remarks,
        dto.metadata ? JSON.stringify(dto.metadata) : null,
        userId,
      ],
    );

    this.logger.log(`INDICATOR_CREATED: id=${result.rows[0].id}, operation=${operationId}, by=${userId}`);
    return result.rows[0];
  }

  async updateIndicator(operationId: string, indicatorId: string, dto: Partial<CreateIndicatorDto>, userId: string, user: JwtPayload): Promise<any> {
    // Phase CM: Ownership validation
    await this.validateOperationOwnership(operationId, userId, user);
    // Phase CO: Publication status lock
    await this.validateOperationEditable(operationId, undefined, user);

    const check = await this.db.query(
      `SELECT id FROM operation_indicators WHERE id = $1 AND operation_id = $2 AND deleted_at IS NULL`,
      [indicatorId, operationId],
    );
    if (check.rows.length === 0) {
      throw new NotFoundException(`Indicator ${indicatorId} not found`);
    }

    const fields = Object.keys(dto).filter((k) => dto[k] !== undefined);
    if (fields.length === 0) {
      const current = await this.db.query(`SELECT * FROM operation_indicators WHERE id = $1`, [indicatorId]);
      return current.rows[0];
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map((f) => (f === 'metadata' ? JSON.stringify(dto[f]) : dto[f]));

    const result = await this.db.query(
      `UPDATE operation_indicators
       SET ${setClause}, updated_by = $${fields.length + 1}, updated_at = NOW()
       WHERE id = $${fields.length + 2}
       RETURNING *`,
      [...values, userId, indicatorId],
    );

    this.logger.log(`INDICATOR_UPDATED: id=${indicatorId}, by=${userId}`);
    return result.rows[0];
  }

  async removeIndicator(operationId: string, indicatorId: string, userId: string, user: JwtPayload): Promise<void> {
    // Phase CM: Ownership validation (Admin check at controller, but still verify ownership context)
    await this.validateOperationOwnership(operationId, userId, user);
    // Phase CO: Publication status lock
    await this.validateOperationEditable(operationId, undefined, user);

    const result = await this.db.query(
      `UPDATE operation_indicators SET deleted_at = NOW(), deleted_by = $1
       WHERE id = $2 AND operation_id = $3 AND deleted_at IS NULL`,
      [userId, indicatorId, operationId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException(`Indicator ${indicatorId} not found`);
    }

    this.logger.log(`INDICATOR_DELETED: id=${indicatorId}, by=${userId}`);
  }

  // --- Financials ---
  // Phase BC: Added fund_type filter for BAR1 tab-based categorization
  async findFinancials(operationId: string, fiscalYear?: number, quarter?: string, fundType?: FundType): Promise<any[]> {
    await this.findOne(operationId);

    let query = `SELECT * FROM operation_financials WHERE operation_id = $1 AND deleted_at IS NULL`;
    const params: any[] = [operationId];
    let paramIndex = 2;

    if (fiscalYear) {
      query += ` AND fiscal_year = $${paramIndex++}`;
      params.push(fiscalYear);
    }
    if (quarter) {
      query += ` AND quarter = $${paramIndex++}`;
      params.push(quarter);
    }
    // Phase BC: fund_type filter for BAR1 subcategory tabs
    if (fundType) {
      query += ` AND fund_type = $${paramIndex++}`;
      params.push(fundType);
    }

    query += ` ORDER BY fiscal_year DESC, quarter, operations_programs`;

    const result = await this.db.query(query, params);
    // Phase CP: Apply computed metrics to each financial record
    return result.rows.map((row) => this.computeFinancialMetrics(row));
  }

  async createFinancial(operationId: string, dto: CreateFinancialDto, userId: string, user: JwtPayload): Promise<any> {
    // Phase CN: Ownership validation
    await this.validateOperationOwnership(operationId, userId, user);
    // Phase CO: Publication status lock
    await this.validateOperationEditable(operationId, undefined, user);

    // Phase BC: Include fund_type and project_code in INSERT
    const result = await this.db.query(
      `INSERT INTO operation_financials
       (operation_id, fiscal_year, quarter, operations_programs, department, budget_source,
        fund_type, project_code,
        allotment, target, obligation, disbursement, performance_indicator, remarks, metadata, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [
        operationId,
        dto.fiscal_year,
        dto.quarter,
        dto.operations_programs,
        dto.department,
        dto.budget_source,
        dto.fund_type || null,
        dto.project_code || null,
        dto.allotment,
        dto.target,
        dto.obligation,
        dto.disbursement,
        dto.performance_indicator,
        dto.remarks,
        dto.metadata ? JSON.stringify(dto.metadata) : null,
        userId,
      ],
    );

    this.logger.log(`FINANCIAL_CREATED: id=${result.rows[0].id}, operation=${operationId}, by=${userId}`);
    // Phase CP: Return record with computed metrics
    return this.computeFinancialMetrics(result.rows[0]);
  }

  async updateFinancial(operationId: string, financialId: string, dto: Partial<CreateFinancialDto>, userId: string, user: JwtPayload): Promise<any> {
    // Phase CN: Ownership validation
    await this.validateOperationOwnership(operationId, userId, user);
    // Phase CO: Publication status lock
    await this.validateOperationEditable(operationId, undefined, user);

    const check = await this.db.query(
      `SELECT id FROM operation_financials WHERE id = $1 AND operation_id = $2 AND deleted_at IS NULL`,
      [financialId, operationId],
    );
    if (check.rows.length === 0) {
      throw new NotFoundException(`Financial record ${financialId} not found`);
    }

    const fields = Object.keys(dto).filter((k) => dto[k] !== undefined);
    if (fields.length === 0) {
      const current = await this.db.query(`SELECT * FROM operation_financials WHERE id = $1`, [financialId]);
      // Phase CP: Return record with computed metrics
      return this.computeFinancialMetrics(current.rows[0]);
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map((f) => (f === 'metadata' ? JSON.stringify(dto[f]) : dto[f]));

    const result = await this.db.query(
      `UPDATE operation_financials
       SET ${setClause}, updated_by = $${fields.length + 1}, updated_at = NOW()
       WHERE id = $${fields.length + 2}
       RETURNING *`,
      [...values, userId, financialId],
    );

    this.logger.log(`FINANCIAL_UPDATED: id=${financialId}, by=${userId}`);
    // Phase CP: Return record with computed metrics
    return this.computeFinancialMetrics(result.rows[0]);
  }

  async removeFinancial(operationId: string, financialId: string, userId: string, user: JwtPayload): Promise<void> {
    // Phase CN: Ownership validation (Admin check at controller, but verify ownership context)
    await this.validateOperationOwnership(operationId, userId, user);
    // Phase CO: Publication status lock
    await this.validateOperationEditable(operationId, undefined, user);

    const result = await this.db.query(
      `UPDATE operation_financials SET deleted_at = NOW(), deleted_by = $1
       WHERE id = $2 AND operation_id = $3 AND deleted_at IS NULL`,
      [userId, financialId, operationId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException(`Financial record ${financialId} not found`);
    }

    this.logger.log(`FINANCIAL_DELETED: id=${financialId}, by=${userId}`);
  }

  // ─── Phase CH: Organizational Info CRUD ─────────────────────────────────

  /**
   * Phase CH: Update or create organizational info for a university operation.
   * Handles both INSERT (first time) and UPDATE (subsequent edits).
   */
  async updateOrganizationalInfo(
    operationId: string,
    dto: { department?: string; agency_entity?: string; operating_unit?: string; organization_code?: string },
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    // Verify operation exists
    await this.findOne(operationId);

    // Check if org info record already exists
    const existing = await this.db.query(
      `SELECT id FROM operation_organizational_info WHERE operation_id = $1`,
      [operationId],
    );

    if (existing.rowCount === 0) {
      // INSERT new record
      await this.db.query(
        `INSERT INTO operation_organizational_info
         (operation_id, department, agency_entity, operating_unit, organization_code, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [
          operationId,
          dto.department || '',
          dto.agency_entity || '',
          dto.operating_unit || '',
          dto.organization_code || '',
        ],
      );
      this.logger.log(`ORG_INFO_CREATED: operation=${operationId}, by=${userId}`);
    } else {
      // UPDATE existing record
      await this.db.query(
        `UPDATE operation_organizational_info
         SET department = $1, agency_entity = $2, operating_unit = $3,
             organization_code = $4, updated_at = NOW()
         WHERE operation_id = $5`,
        [
          dto.department || '',
          dto.agency_entity || '',
          dto.operating_unit || '',
          dto.organization_code || '',
          operationId,
        ],
      );
      this.logger.log(`ORG_INFO_UPDATED: operation=${operationId}, by=${userId}`);
    }

    return { success: true, message: 'Organizational info updated successfully' };
  }

  /**
   * Phase CH: Fetch organizational info for a university operation.
   */
  async findOrganizationalInfo(operationId: string): Promise<any> {
    await this.findOne(operationId);

    const result = await this.db.query(
      `SELECT department, agency_entity, operating_unit, organization_code, created_at, updated_at
       FROM operation_organizational_info
       WHERE operation_id = $1`,
      [operationId],
    );

    if (result.rowCount === 0) {
      return { department: '', agency_entity: '', operating_unit: '', organization_code: '' };
    }

    return result.rows[0];
  }

  /**
   * Phase CX-F: Diagnostic method to check orphan indicator status
   * Returns count of orphan indicators (those without pillar_indicator_id)
   */
  async getOrphanIndicatorDiagnostics(): Promise<{
    totalIndicators: number;
    linkedIndicators: number;
    orphanIndicators: number;
    orphansByPillar: { pillar_type: string; count: number }[];
  }> {
    const [totalRes, linkedRes, orphansByPillarRes] = await Promise.all([
      this.db.query(`SELECT COUNT(*) FROM operation_indicators WHERE deleted_at IS NULL`),
      this.db.query(`SELECT COUNT(*) FROM operation_indicators WHERE deleted_at IS NULL AND pillar_indicator_id IS NOT NULL`),
      this.db.query(`
        SELECT o.operation_type AS pillar_type, COUNT(i.id) AS count
        FROM operation_indicators i
        JOIN university_operations o ON i.operation_id = o.id
        WHERE i.deleted_at IS NULL AND i.pillar_indicator_id IS NULL
        GROUP BY o.operation_type
        ORDER BY o.operation_type
      `),
    ]);

    const total = parseInt(totalRes.rows[0].count, 10);
    const linked = parseInt(linkedRes.rows[0].count, 10);

    return {
      totalIndicators: total,
      linkedIndicators: linked,
      orphanIndicators: total - linked,
      orphansByPillar: orphansByPillarRes.rows.map((r) => ({
        pillar_type: r.pillar_type,
        count: parseInt(r.count, 10),
      })),
    };
  }

  /**
   * Phase DK-D: Get detailed list of orphaned indicators for admin review
   * Returns full orphan records with quarterly data status
   */
  async getOrphanedIndicatorsList(): Promise<any[]> {
    const result = await this.db.query(
      `SELECT
        oi.id,
        oi.operation_id,
        oi.particular,
        oi.fiscal_year,
        oi.created_at,
        oi.updated_at,
        oi.remarks,
        oi.target_q1, oi.target_q2, oi.target_q3, oi.target_q4,
        oi.accomplishment_q1, oi.accomplishment_q2, oi.accomplishment_q3, oi.accomplishment_q4,
        uo.title AS operation_title,
        uo.operation_type,
        CASE
          WHEN oi.target_q1 IS NOT NULL OR oi.target_q2 IS NOT NULL OR
               oi.target_q3 IS NOT NULL OR oi.target_q4 IS NOT NULL OR
               oi.accomplishment_q1 IS NOT NULL OR oi.accomplishment_q2 IS NOT NULL OR
               oi.accomplishment_q3 IS NOT NULL OR oi.accomplishment_q4 IS NOT NULL
          THEN TRUE
          ELSE FALSE
        END AS has_quarterly_data
       FROM operation_indicators oi
       JOIN university_operations uo ON oi.operation_id = uo.id
       WHERE oi.pillar_indicator_id IS NULL
         AND oi.deleted_at IS NULL
       ORDER BY oi.fiscal_year DESC, uo.operation_type, oi.particular`,
    );

    this.logger.log(`[getOrphanedIndicatorsList] Found ${result.rows.length} orphaned indicators`);
    return result.rows;
  }

  // ─── Phase DE: Analytics Methods ─────────────────────────────────────────────

  /**
   * Phase DE-A: Get pillar summary analytics
   * Returns aggregated metrics for each pillar including:
   * - Total indicators in taxonomy
   * - Indicators with data for the fiscal year
   * - Average accomplishment rate across all indicators
   */
  async getPillarSummary(fiscalYear: number): Promise<{
    pillars: {
      pillar_type: string;
      pillar_label: string;
      organizational_outcome: string;
      total_taxonomy_indicators: number;
      indicators_with_data: number;
      completion_rate: number;
      total_target: number;
      total_accomplishment: number;
      count_target: number;
      count_accomplishment: number;
      pct_avg_target: number | null;
      pct_avg_accomplishment: number | null;
      pct_indicator_count: number;
      count_indicator_count: number;
      average_accomplishment_rate: number | null;
      // Phase DR-A: Rate-based fields
      indicator_target_rate: number;
      indicator_actual_rate: number | null;
      accomplishment_rate_pct: number | null;
      outcome_indicators: number;
      output_indicators: number;
    }[];
    fiscal_year: number;
  }> {
    const pillarLabels: Record<string, string> = {
      HIGHER_EDUCATION: 'Higher Education Program',
      ADVANCED_EDUCATION: 'Advanced Education Program',
      RESEARCH: 'Research Program',
      TECHNICAL_ADVISORY: 'Technical Advisory & Extension Program',
    };

    const pillarOO: Record<string, string> = {
      HIGHER_EDUCATION: 'OO1',
      ADVANCED_EDUCATION: 'OO1',
      RESEARCH: 'OO2',
      TECHNICAL_ADVISORY: 'OO3',
    };

    // Get taxonomy counts per pillar
    const taxonomyRes = await this.db.query(`
      SELECT
        pillar_type,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE indicator_type = 'OUTCOME') AS outcome_count,
        COUNT(*) FILTER (WHERE indicator_type = 'OUTPUT') AS output_count
      FROM pillar_indicator_taxonomy
      WHERE is_active = true
      GROUP BY pillar_type
      ORDER BY pillar_type
    `);

    // Phase DQ-B: Unit-type-aware aggregation with cross-operation deduplication
    // Uses DISTINCT ON to pick one row per indicator (latest updated) to prevent
    // double-counting when multiple operations exist for the same pillar/fiscal year.
    // Aggregation rules:
    //   COUNT/WEIGHTED_COUNT: SUM of Q1+Q2+Q3+Q4 (cumulative annual total)
    //   PERCENTAGE: AVG of non-null quarters (annual average rate)
    const dataRes = await this.db.query(`
      SELECT
        deduped.pillar_type,
        COUNT(DISTINCT deduped.pillar_indicator_id) AS indicators_with_data,
        SUM(
          CASE WHEN deduped.unit_type IN ('COUNT', 'WEIGHTED_COUNT')
            THEN COALESCE(deduped.target_q1,0) + COALESCE(deduped.target_q2,0) + COALESCE(deduped.target_q3,0) + COALESCE(deduped.target_q4,0)
            ELSE 0
          END
        ) AS count_target,
        SUM(
          CASE WHEN deduped.unit_type IN ('COUNT', 'WEIGHTED_COUNT')
            THEN COALESCE(deduped.accomplishment_q1,0) + COALESCE(deduped.accomplishment_q2,0) + COALESCE(deduped.accomplishment_q3,0) + COALESCE(deduped.accomplishment_q4,0)
            ELSE 0
          END
        ) AS count_accomplishment,
        AVG(
          CASE WHEN deduped.unit_type = 'PERCENTAGE' THEN
            (COALESCE(deduped.target_q1,0) + COALESCE(deduped.target_q2,0) + COALESCE(deduped.target_q3,0) + COALESCE(deduped.target_q4,0))
            / NULLIF(
              (CASE WHEN deduped.target_q1 IS NOT NULL AND deduped.target_q1 != 0 THEN 1 ELSE 0 END) +
              (CASE WHEN deduped.target_q2 IS NOT NULL AND deduped.target_q2 != 0 THEN 1 ELSE 0 END) +
              (CASE WHEN deduped.target_q3 IS NOT NULL AND deduped.target_q3 != 0 THEN 1 ELSE 0 END) +
              (CASE WHEN deduped.target_q4 IS NOT NULL AND deduped.target_q4 != 0 THEN 1 ELSE 0 END)
            , 0)
          ELSE NULL END
        ) AS pct_avg_target,
        AVG(
          CASE WHEN deduped.unit_type = 'PERCENTAGE' THEN
            (COALESCE(deduped.accomplishment_q1,0) + COALESCE(deduped.accomplishment_q2,0) + COALESCE(deduped.accomplishment_q3,0) + COALESCE(deduped.accomplishment_q4,0))
            / NULLIF(
              (CASE WHEN deduped.accomplishment_q1 IS NOT NULL AND deduped.accomplishment_q1 != 0 THEN 1 ELSE 0 END) +
              (CASE WHEN deduped.accomplishment_q2 IS NOT NULL AND deduped.accomplishment_q2 != 0 THEN 1 ELSE 0 END) +
              (CASE WHEN deduped.accomplishment_q3 IS NOT NULL AND deduped.accomplishment_q3 != 0 THEN 1 ELSE 0 END) +
              (CASE WHEN deduped.accomplishment_q4 IS NOT NULL AND deduped.accomplishment_q4 != 0 THEN 1 ELSE 0 END)
            , 0)
          ELSE NULL END
        ) AS pct_avg_accomplishment,
        COUNT(CASE WHEN deduped.unit_type = 'PERCENTAGE' THEN 1 END) AS pct_indicator_count,
        COUNT(CASE WHEN deduped.unit_type IN ('COUNT', 'WEIGHTED_COUNT') THEN 1 END) AS count_indicator_count,
        AVG(
          CASE
            WHEN COALESCE(deduped.target_q1,0) + COALESCE(deduped.target_q2,0) + COALESCE(deduped.target_q3,0) + COALESCE(deduped.target_q4,0) > 0
            THEN (
              (COALESCE(deduped.accomplishment_q1,0) + COALESCE(deduped.accomplishment_q2,0) + COALESCE(deduped.accomplishment_q3,0) + COALESCE(deduped.accomplishment_q4,0)) /
              NULLIF(COALESCE(deduped.target_q1,0) + COALESCE(deduped.target_q2,0) + COALESCE(deduped.target_q3,0) + COALESCE(deduped.target_q4,0), 0)
            ) * 100
            ELSE NULL
          END
        ) AS avg_accomplishment_rate,
        -- Phase DR-A: Rate-based aggregation
        -- indicator_target_rate = count of indicators with any target data (each contributes 1.0)
        SUM(
          CASE
            WHEN (COALESCE(deduped.target_q1,0)+COALESCE(deduped.target_q2,0)+COALESCE(deduped.target_q3,0)+COALESCE(deduped.target_q4,0)) > 0
            THEN 1.0
            ELSE 0
          END
        ) AS indicator_target_rate,
        -- indicator_actual_rate = SUM of (actual/target) per indicator (dimensionless)
        SUM(
          CASE
            WHEN (COALESCE(deduped.target_q1,0)+COALESCE(deduped.target_q2,0)+COALESCE(deduped.target_q3,0)+COALESCE(deduped.target_q4,0)) > 0
            THEN (
              COALESCE(deduped.accomplishment_q1,0)+COALESCE(deduped.accomplishment_q2,0)+COALESCE(deduped.accomplishment_q3,0)+COALESCE(deduped.accomplishment_q4,0)
            ) /
            NULLIF(
              COALESCE(deduped.target_q1,0)+COALESCE(deduped.target_q2,0)+COALESCE(deduped.target_q3,0)+COALESCE(deduped.target_q4,0)
            , 0)
            ELSE NULL
          END
        ) AS indicator_actual_rate
      FROM (
        SELECT DISTINCT ON (oi.pillar_indicator_id)
          oi.*, pit.pillar_type, pit.unit_type, pit.indicator_type
        FROM operation_indicators oi
        JOIN pillar_indicator_taxonomy pit ON oi.pillar_indicator_id = pit.id
        WHERE oi.fiscal_year = $1 AND oi.deleted_at IS NULL AND pit.is_active = true
        ORDER BY oi.pillar_indicator_id, oi.updated_at DESC
      ) AS deduped
      GROUP BY deduped.pillar_type
    `, [fiscalYear]);

    // Phase DQ-B: Build response with unit-type-aware fields
    const dataMap = new Map<string, any>(
      dataRes.rows.map((r) => [r.pillar_type, r])
    );

    const pillars = taxonomyRes.rows.map((t) => {
      const data = dataMap.get(t.pillar_type);
      const totalTaxonomy = parseInt(t.total, 10);
      const withData = data ? parseInt(data.indicators_with_data, 10) : 0;

      const completionRate = totalTaxonomy > 0
        ? parseFloat(((withData / totalTaxonomy) * 100).toFixed(2))
        : 0;

      const countTarget = data?.count_target ? parseFloat(data.count_target) : 0;
      const countAccomplishment = data?.count_accomplishment ? parseFloat(data.count_accomplishment) : 0;
      const pctAvgTarget = data?.pct_avg_target ? parseFloat(parseFloat(data.pct_avg_target).toFixed(2)) : null;
      const pctAvgAccomplishment = data?.pct_avg_accomplishment ? parseFloat(parseFloat(data.pct_avg_accomplishment).toFixed(2)) : null;

      return {
        pillar_type: t.pillar_type,
        pillar_label: pillarLabels[t.pillar_type] || t.pillar_type,
        organizational_outcome: pillarOO[t.pillar_type] || '',
        total_taxonomy_indicators: totalTaxonomy,
        indicators_with_data: withData,
        completion_rate: completionRate,
        // Phase DQ-B: Unit-type-aware totals
        count_target: countTarget,
        count_accomplishment: countAccomplishment,
        pct_avg_target: pctAvgTarget,
        pct_avg_accomplishment: pctAvgAccomplishment,
        pct_indicator_count: data?.pct_indicator_count ? parseInt(data.pct_indicator_count, 10) : 0,
        count_indicator_count: data?.count_indicator_count ? parseInt(data.count_indicator_count, 10) : 0,
        // Backward-compat: total_target now = count totals + pct averages (meaningful composite)
        total_target: countTarget + (pctAvgTarget || 0),
        total_accomplishment: countAccomplishment + (pctAvgAccomplishment || 0),
        average_accomplishment_rate: data?.avg_accomplishment_rate
          ? parseFloat(parseFloat(data.avg_accomplishment_rate).toFixed(2))
          : null,
        // Phase DR-A: Rate-based fields
        indicator_target_rate: data?.indicator_target_rate ? parseFloat(data.indicator_target_rate) : 0,
        indicator_actual_rate: data?.indicator_actual_rate ? parseFloat(parseFloat(data.indicator_actual_rate).toFixed(4)) : null,
        accomplishment_rate_pct: (() => {
          const targetRate = data?.indicator_target_rate ? parseFloat(data.indicator_target_rate) : 0;
          const actualRate = data?.indicator_actual_rate ? parseFloat(data.indicator_actual_rate) : null;
          if (targetRate > 0 && actualRate !== null) {
            return parseFloat(((actualRate / targetRate) * 100).toFixed(2));
          }
          return null;
        })(),
        outcome_indicators: parseInt(t.outcome_count, 10),
        output_indicators: parseInt(t.output_count, 10),
      };
    });

    return {
      pillars,
      fiscal_year: fiscalYear,
    };
  }

  /**
   * Phase DR-B: Get quarterly trend data (rate-based)
   * Returns Q1-Q4 rate data for trend visualization
   * Rate model: target_rate = COUNT(indicators with target), actual_rate = SUM(actual/target)
   */
  async getQuarterlyTrend(
    fiscalYear: number,
    pillarType?: string,
  ): Promise<{
    quarters: {
      quarter: string;
      target_rate: number;
      actual_rate: number | null;
      accomplishment_rate_pct: number | null;
    }[];
    fiscal_year: number;
    pillar_type: string | null;
  }> {
    // Phase DR-B: Rate-based quarterly trend with cross-operation deduplication
    // Per quarter: target_rate = count of indicators with target > 0
    //              actual_rate = SUM(accomplishment/target) for those indicators
    let pillarFilter = '';
    const params: any[] = [fiscalYear];

    if (pillarType) {
      pillarFilter = `AND pit.pillar_type = $2`;
      params.push(pillarType);
    }

    const query = `
      SELECT
        -- Phase DR-B: Per-quarter rate computation
        SUM(CASE WHEN deduped.target_q1 > 0 THEN 1.0 ELSE 0 END) AS target_rate_q1,
        SUM(CASE WHEN deduped.target_q2 > 0 THEN 1.0 ELSE 0 END) AS target_rate_q2,
        SUM(CASE WHEN deduped.target_q3 > 0 THEN 1.0 ELSE 0 END) AS target_rate_q3,
        SUM(CASE WHEN deduped.target_q4 > 0 THEN 1.0 ELSE 0 END) AS target_rate_q4,
        SUM(CASE WHEN deduped.target_q1 > 0 THEN COALESCE(deduped.accomplishment_q1,0)/deduped.target_q1 ELSE NULL END) AS actual_rate_q1,
        SUM(CASE WHEN deduped.target_q2 > 0 THEN COALESCE(deduped.accomplishment_q2,0)/deduped.target_q2 ELSE NULL END) AS actual_rate_q2,
        SUM(CASE WHEN deduped.target_q3 > 0 THEN COALESCE(deduped.accomplishment_q3,0)/deduped.target_q3 ELSE NULL END) AS actual_rate_q3,
        SUM(CASE WHEN deduped.target_q4 > 0 THEN COALESCE(deduped.accomplishment_q4,0)/deduped.target_q4 ELSE NULL END) AS actual_rate_q4
      FROM (
        SELECT DISTINCT ON (oi.pillar_indicator_id)
          oi.*, pit.pillar_type, pit.unit_type
        FROM operation_indicators oi
        JOIN pillar_indicator_taxonomy pit ON oi.pillar_indicator_id = pit.id
        WHERE oi.fiscal_year = $1 AND oi.deleted_at IS NULL AND pit.is_active = true
        ${pillarFilter}
        ORDER BY oi.pillar_indicator_id, oi.updated_at DESC
      ) AS deduped
    `;

    const result = await this.db.query(query, params);
    const row = result.rows[0] || {};

    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => {
      const qNum = i + 1;
      const targetRate = parseFloat(row[`target_rate_q${qNum}`]) || 0;
      const actualRate = row[`actual_rate_q${qNum}`] != null ? parseFloat(row[`actual_rate_q${qNum}`]) : null;
      const ratePct = targetRate > 0 && actualRate !== null
        ? parseFloat(((actualRate / targetRate) * 100).toFixed(2))
        : null;

      return {
        quarter: q,
        target_rate: targetRate,
        actual_rate: actualRate !== null ? parseFloat(actualRate.toFixed(4)) : null,
        accomplishment_rate_pct: ratePct,
      };
    });

    return {
      quarters,
      fiscal_year: fiscalYear,
      pillar_type: pillarType || null,
    };
  }

  /**
   * Phase DE-A: Get year-over-year comparison
   * Returns comparison data across multiple fiscal years
   */
  async getYearlyComparison(years: number[]): Promise<{
    years: {
      fiscal_year: number;
      total_indicators: number;
      total_target: number;
      total_accomplishment: number;
      overall_accomplishment_rate: number | null;
      pillars: {
        pillar_type: string;
        accomplishment_rate: number | null;
      }[];
    }[];
  }> {
    if (years.length === 0) {
      return { years: [] };
    }

    // Get yearly aggregates
    const yearlyRes = await this.db.query(`
      SELECT
        oi.fiscal_year,
        COUNT(DISTINCT oi.id) AS total_indicators,
        SUM(COALESCE(oi.target_q1, 0) + COALESCE(oi.target_q2, 0) + COALESCE(oi.target_q3, 0) + COALESCE(oi.target_q4, 0)) AS total_target,
        SUM(COALESCE(oi.accomplishment_q1, 0) + COALESCE(oi.accomplishment_q2, 0) + COALESCE(oi.accomplishment_q3, 0) + COALESCE(oi.accomplishment_q4, 0)) AS total_accomplishment
      FROM operation_indicators oi
      WHERE oi.fiscal_year = ANY($1) AND oi.deleted_at IS NULL
      GROUP BY oi.fiscal_year
      ORDER BY oi.fiscal_year
    `, [years]);

    // Get pillar breakdown per year
    const pillarRes = await this.db.query(`
      SELECT
        oi.fiscal_year,
        pit.pillar_type,
        SUM(COALESCE(oi.target_q1, 0) + COALESCE(oi.target_q2, 0) + COALESCE(oi.target_q3, 0) + COALESCE(oi.target_q4, 0)) AS total_target,
        SUM(COALESCE(oi.accomplishment_q1, 0) + COALESCE(oi.accomplishment_q2, 0) + COALESCE(oi.accomplishment_q3, 0) + COALESCE(oi.accomplishment_q4, 0)) AS total_accomplishment
      FROM operation_indicators oi
      JOIN pillar_indicator_taxonomy pit ON oi.pillar_indicator_id = pit.id
      WHERE oi.fiscal_year = ANY($1) AND oi.deleted_at IS NULL
      GROUP BY oi.fiscal_year, pit.pillar_type
      ORDER BY oi.fiscal_year, pit.pillar_type
    `, [years]);

    // Build pillar map per year
    const pillarMap = new Map<number, Map<string, { target: number; accomplishment: number }>>();
    for (const row of pillarRes.rows) {
      if (!pillarMap.has(row.fiscal_year)) {
        pillarMap.set(row.fiscal_year, new Map());
      }
      pillarMap.get(row.fiscal_year)!.set(row.pillar_type, {
        target: parseFloat(row.total_target) || 0,
        accomplishment: parseFloat(row.total_accomplishment) || 0,
      });
    }

    const validPillarTypes = ['HIGHER_EDUCATION', 'ADVANCED_EDUCATION', 'RESEARCH', 'TECHNICAL_ADVISORY'];

    const yearsData = yearlyRes.rows.map((row) => {
      const totalTarget = parseFloat(row.total_target) || 0;
      const totalAccomplishment = parseFloat(row.total_accomplishment) || 0;
      const overallRate = totalTarget > 0 ? (totalAccomplishment / totalTarget) * 100 : null;

      const yearPillars = pillarMap.get(row.fiscal_year) || new Map();
      const pillars = validPillarTypes.map((pt) => {
        const p = yearPillars.get(pt);
        const rate = p && p.target > 0 ? (p.accomplishment / p.target) * 100 : null;
        return {
          pillar_type: pt,
          accomplishment_rate: rate !== null ? parseFloat(rate.toFixed(2)) : null,
        };
      });

      return {
        fiscal_year: row.fiscal_year,
        total_indicators: parseInt(row.total_indicators, 10),
        total_target: parseFloat(totalTarget.toFixed(2)),
        total_accomplishment: parseFloat(totalAccomplishment.toFixed(2)),
        overall_accomplishment_rate: overallRate !== null ? parseFloat(overallRate.toFixed(2)) : null,
        pillars,
      };
    });

    return { years: yearsData };
  }

  // ═══════════════════════════════════════════════════════════════
  // Phase DO-B: Fiscal Year Configuration (SuperAdmin only)
  // ═══════════════════════════════════════════════════════════════

  async getActiveFiscalYears(): Promise<{ year: number; label: string }[]> {
    const result = await this.db.query(
      `SELECT year, label FROM fiscal_years WHERE is_active = true ORDER BY year DESC`,
    );
    return result.rows;
  }

  async createFiscalYear(year: number, label?: string): Promise<{ year: number; label: string; is_active: boolean }> {
    const existing = await this.db.query(`SELECT year FROM fiscal_years WHERE year = $1`, [year]);
    if (existing.rows.length > 0) {
      throw new ConflictException(`Fiscal year ${year} already exists`);
    }
    const fyLabel = label || `FY ${year}`;
    const result = await this.db.query(
      `INSERT INTO fiscal_years (year, is_active, label) VALUES ($1, true, $2) RETURNING year, label, is_active`,
      [year, fyLabel],
    );
    return result.rows[0];
  }

  async toggleFiscalYear(year: number, isActive: boolean): Promise<{ year: number; label: string; is_active: boolean }> {
    const result = await this.db.query(
      `UPDATE fiscal_years SET is_active = $2, updated_at = NOW() WHERE year = $1 RETURNING year, label, is_active`,
      [year, isActive],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Fiscal year ${year} not found`);
    }
    return result.rows[0];
  }

  // ─── Phase EM-B: Quarterly Reports ─────────────────────────────────────────

  private readonly QUARTER_TITLES: Record<string, string> = {
    Q1: 'Quarter 1 (Jan–March)',
    Q2: 'Quarter 2 (Apr–June)',
    Q3: 'Quarter 3 (Jul–Sep)',
    Q4: 'Quarter 4 (Oct–Dec)',
  };

  async createQuarterlyReport(fiscalYear: number, quarter: string, userId: string): Promise<any> {
    this.validateQuarterParam(quarter);

    // Check for existing record (UNIQUE constraint backup)
    const existing = await this.db.query(
      `SELECT id, publication_status FROM quarterly_reports
       WHERE fiscal_year = $1 AND quarter = $2 AND deleted_at IS NULL`,
      [fiscalYear, quarter],
    );
    if (existing.rows.length > 0) {
      // Return existing record instead of throwing conflict
      return existing.rows[0];
    }

    const title = `${this.QUARTER_TITLES[quarter]} FY ${fiscalYear}`;
    const result = await this.db.query(
      `INSERT INTO quarterly_reports (fiscal_year, quarter, title, publication_status, created_by)
       VALUES ($1, $2, $3, 'DRAFT', $4)
       RETURNING *`,
      [fiscalYear, quarter, title, userId],
    );

    this.logger.log(`QUARTERLY_REPORT_CREATED: FY=${fiscalYear}, Q=${quarter}, by=${userId}`);
    return result.rows[0];
  }

  async findQuarterlyReports(fiscalYear?: number, quarter?: string): Promise<any[]> {
    let query = `SELECT qr.*, u.first_name || ' ' || u.last_name as submitter_name
                 FROM quarterly_reports qr
                 LEFT JOIN users u ON qr.submitted_by = u.id
                 WHERE qr.deleted_at IS NULL`;
    const params: any[] = [];
    let paramIdx = 1;

    if (fiscalYear) {
      query += ` AND qr.fiscal_year = $${paramIdx++}`;
      params.push(fiscalYear);
    }
    if (quarter) {
      query += ` AND qr.quarter = $${paramIdx++}`;
      params.push(quarter);
    }

    query += ' ORDER BY qr.fiscal_year DESC, qr.quarter ASC';
    const result = await this.db.query(query, params);
    return result.rows;
  }

  async findOneQuarterlyReport(id: string): Promise<any> {
    const result = await this.db.query(
      `SELECT qr.*, u.first_name || ' ' || u.last_name as submitter_name
       FROM quarterly_reports qr
       LEFT JOIN users u ON qr.submitted_by = u.id
       WHERE qr.id = $1 AND qr.deleted_at IS NULL`,
      [id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Quarterly report ${id} not found`);
    }
    return result.rows[0];
  }

  async findQuarterlyReportsPendingReview(user: JwtPayload): Promise<any[]> {
    if (!this.isAdmin(user)) {
      throw new ForbiddenException('Only Admin can view pending reviews');
    }

    // Module access check (same pattern as findPendingReview)
    if (!user.is_superadmin) {
      const accessCheck = await this.db.query(
        `SELECT 1 FROM user_module_assignments
         WHERE user_id = $1
           AND (module = 'OPERATIONS' OR module = 'ALL')`,
        [user.sub],
      );
      if (accessCheck.rows.length === 0) {
        return [];
      }
    }

    const result = await this.db.query(
      `SELECT qr.id, qr.fiscal_year, qr.quarter, qr.title, qr.publication_status,
              qr.submitted_by, qr.submitted_at, qr.created_at,
              u.first_name || ' ' || u.last_name as submitter_name
       FROM quarterly_reports qr
       LEFT JOIN users u ON qr.submitted_by = u.id
       WHERE qr.publication_status = 'PENDING_REVIEW'
         AND qr.deleted_at IS NULL
       ORDER BY qr.submitted_at ASC`,
    );
    return result.rows;
  }

  async submitQuarterlyReport(id: string, userId: string): Promise<any> {
    const report = await this.findOneQuarterlyReport(id);

    if (report.publication_status !== 'DRAFT' && report.publication_status !== 'REJECTED') {
      throw new BadRequestException(
        `Only DRAFT or REJECTED reports can be submitted. Current status: ${report.publication_status}`,
      );
    }

    // Creator can submit
    if (report.created_by !== userId) {
      // Check if user is admin (admins can submit any)
      const adminCheck = await this.db.query(
        `SELECT role FROM users WHERE id = $1`,
        [userId],
      );
      const isAdmin = adminCheck.rows[0]?.role === 'Admin';
      if (!isAdmin) {
        throw new ForbiddenException('Only the creator or an admin can submit this report');
      }
    }

    // Phase GOV-D: Snapshot submission event and increment submission_count
    await this.snapshotSubmissionHistory(
      { ...report, submission_count: (report.submission_count || 0) + 1 },
      'SUBMITTED', userId,
    );

    const result = await this.db.query(
      `UPDATE quarterly_reports
       SET publication_status = 'PENDING_REVIEW',
           submitted_by = $1,
           submitted_at = NOW(),
           review_notes = NULL,
           submission_count = COALESCE(submission_count, 0) + 1,
           updated_at = NOW()
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [userId, id],
    );

    this.logger.log(`QUARTERLY_REPORT_SUBMITTED: id=${id}, by=${userId}`);
    return result.rows[0];
  }

  async approveQuarterlyReport(id: string, adminId: string, user: JwtPayload): Promise<any> {
    if (!this.permissionResolver.isAdmin(user)) {
      throw new ForbiddenException('Only Admin can approve quarterly reports');
    }

    const report = await this.findOneQuarterlyReport(id);

    if (report.publication_status !== 'PENDING_REVIEW') {
      throw new BadRequestException(
        `Only PENDING_REVIEW reports can be approved. Current status: ${report.publication_status}`,
      );
    }

    // Rank-based approval check (includes self-approval prevention)
    const approvalCheck = await this.permissionResolver.canApproveByRank(
      adminId,
      report.created_by,
      user.is_superadmin,
    );
    if (!approvalCheck.allowed) {
      throw new ForbiddenException(approvalCheck.reason);
    }

    // Phase GOV-D: Snapshot approval event
    await this.snapshotSubmissionHistory(report, 'APPROVED', adminId);

    const result = await this.db.query(
      `UPDATE quarterly_reports
       SET publication_status = 'PUBLISHED',
           reviewed_by = $1,
           reviewed_at = NOW(),
           review_notes = NULL,
           updated_at = NOW()
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [adminId, id],
    );

    this.logger.log(`QUARTERLY_REPORT_APPROVED: id=${id}, by=${adminId}`);
    return result.rows[0];
  }

  async rejectQuarterlyReport(id: string, adminId: string, notes: string, user: JwtPayload): Promise<any> {
    if (!this.isAdmin(user)) {
      throw new ForbiddenException('Only Admin can reject quarterly reports');
    }

    const report = await this.findOneQuarterlyReport(id);

    if (report.publication_status !== 'PENDING_REVIEW') {
      throw new BadRequestException(
        `Only PENDING_REVIEW reports can be rejected. Current status: ${report.publication_status}`,
      );
    }

    if (!notes || notes.trim().length === 0) {
      throw new BadRequestException('Rejection notes are required');
    }

    // Phase GOV-D: Snapshot rejection event
    await this.snapshotSubmissionHistory(report, 'REJECTED', adminId, notes.trim());

    const result = await this.db.query(
      `UPDATE quarterly_reports
       SET publication_status = 'REJECTED',
           reviewed_by = $1,
           reviewed_at = NOW(),
           review_notes = $2,
           updated_at = NOW()
       WHERE id = $3 AND deleted_at IS NULL
       RETURNING *`,
      [adminId, notes.trim(), id],
    );

    this.logger.log(`QUARTERLY_REPORT_REJECTED: id=${id}, by=${adminId}`);
    return result.rows[0];
  }

  async withdrawQuarterlyReport(id: string, userId: string): Promise<any> {
    const report = await this.findOneQuarterlyReport(id);

    if (report.publication_status !== 'PENDING_REVIEW') {
      throw new BadRequestException(
        `Only PENDING_REVIEW reports can be withdrawn. Current status: ${report.publication_status}`,
      );
    }

    if (report.submitted_by !== userId) {
      throw new ForbiddenException('Only the original submitter can withdraw this report');
    }

    const result = await this.db.query(
      `UPDATE quarterly_reports
       SET publication_status = 'DRAFT',
           submitted_by = NULL,
           submitted_at = NULL,
           updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id],
    );

    this.logger.log(`QUARTERLY_REPORT_WITHDRAWN: id=${id}, by=${userId}`);
    return result.rows[0];
  }

  // ═══════════════════════════════════════════════════════════════
  // Phase GOV: Post-Publication Governance — Unlock & Update Request Workflow
  // ═══════════════════════════════════════════════════════════════

  /**
   * Phase GOV-D: Insert an append-only submission history record.
   * Called before any destructive UPDATE to preserve review metadata.
   */
  private async snapshotSubmissionHistory(
    report: any,
    eventType: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REVERTED' | 'UNLOCKED',
    actorId: string,
    reason?: string,
  ): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO quarterly_report_submissions
           (quarterly_report_id, fiscal_year, quarter, version, event_type,
            submitted_by, submitted_at, reviewed_by, reviewed_at, review_notes,
            actioned_by, actioned_at, reason)
         VALUES ($1, $2, $3, COALESCE($4, 0), $5,
                 $6, $7, $8, $9, $10,
                 $11, NOW(), $12)`,
        [
          report.id,
          report.fiscal_year,
          report.quarter,
          report.submission_count || 0,
          eventType,
          report.submitted_by || null,
          report.submitted_at || null,
          report.reviewed_by || null,
          report.reviewed_at || null,
          report.review_notes || null,
          actorId,
          reason || null,
        ],
      );
    } catch (err) {
      // Non-blocking: history insert failure must not break the primary operation
      this.logger.error(`Failed to snapshot submission history: ${err}`);
    }
  }

  /**
   * Phase GOV-C: Auto-revert quarterly report to DRAFT when indicator data is modified.
   * Ensures any modified report must be re-submitted for review.
   */
  private async autoRevertQuarterlyReport(
    fiscalYear: number | undefined,
    quarter: string | undefined,
    userId: string,
  ): Promise<void> {
    if (!fiscalYear || !quarter) return;

    const report = await this.db.query(
      `SELECT id, fiscal_year, quarter, publication_status, submission_count,
              submitted_by, submitted_at, reviewed_by, reviewed_at, review_notes
       FROM quarterly_reports
       WHERE fiscal_year = $1 AND quarter = $2 AND deleted_at IS NULL`,
      [fiscalYear, quarter],
    );

    if (report.rows.length === 0) return;

    const qr = report.rows[0];
    if (qr.publication_status === 'DRAFT') return;

    // Phase GOV-D: Snapshot review metadata before destroying it
    await this.snapshotSubmissionHistory(qr, 'REVERTED', userId, 'indicator_update');

    await this.db.query(
      `UPDATE quarterly_reports
       SET publication_status = 'DRAFT',
           reviewed_by = NULL,
           reviewed_at = NULL,
           review_notes = NULL,
           submitted_by = NULL,
           submitted_at = NULL,
           updated_at = NOW()
       WHERE id = $1`,
      [qr.id],
    );

    this.logger.log(
      `QUARTERLY_REPORT_AUTO_REVERTED: report_id=${qr.id}, was=${qr.publication_status}, by=${userId}, trigger=indicator_update`,
    );
  }

  /**
   * Phase GOV-A: Unlock a published quarterly report (Admin/SuperAdmin only).
   * Reverts PUBLISHED → DRAFT, clears review/submit metadata, records unlock audit.
   */
  async unlockQuarterlyReport(
    id: string,
    adminId: string,
    reason: string,
    user: JwtPayload,
  ): Promise<any> {
    if (!this.permissionResolver.isAdmin(user)) {
      throw new ForbiddenException('Only Admin can unlock quarterly reports');
    }

    const report = await this.findOneQuarterlyReport(id);

    if (report.publication_status !== 'PUBLISHED') {
      throw new BadRequestException(
        `Only PUBLISHED reports can be unlocked. Current status: ${report.publication_status}`,
      );
    }

    // Phase GOV-D: Snapshot review metadata before destroying it
    await this.snapshotSubmissionHistory(report, 'UNLOCKED', adminId, reason);

    const result = await this.db.query(
      `UPDATE quarterly_reports
       SET publication_status = 'DRAFT',
           reviewed_by = NULL,
           reviewed_at = NULL,
           review_notes = NULL,
           submitted_by = NULL,
           submitted_at = NULL,
           unlocked_by = $1,
           unlocked_at = NOW(),
           unlock_requested_by = NULL,
           unlock_requested_at = NULL,
           unlock_request_reason = NULL,
           updated_at = NOW()
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [adminId, id],
    );

    this.logger.log(
      `QUARTERLY_REPORT_UNLOCKED: id=${id}, by=${adminId}, reason="${reason || 'no reason'}"`,
    );
    return result.rows[0];
  }

  /**
   * Phase GOV-D: Request unlock of a published quarterly report (Staff/Admin).
   * Sets unlock_requested_by fields for admin review.
   */
  async requestQuarterlyReportUnlock(
    id: string,
    userId: string,
    reason: string,
  ): Promise<any> {
    const report = await this.findOneQuarterlyReport(id);

    if (report.publication_status !== 'PUBLISHED') {
      throw new BadRequestException(
        `Only PUBLISHED reports can have unlock requests. Current status: ${report.publication_status}`,
      );
    }

    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('A reason is required for the unlock request');
    }

    if (report.unlock_requested_by) {
      throw new BadRequestException(
        'An unlock request is already pending for this report',
      );
    }

    const result = await this.db.query(
      `UPDATE quarterly_reports
       SET unlock_requested_by = $1,
           unlock_requested_at = NOW(),
           unlock_request_reason = $2,
           updated_at = NOW()
       WHERE id = $3 AND deleted_at IS NULL
       RETURNING *`,
      [userId, reason.trim(), id],
    );

    this.logger.log(
      `QUARTERLY_REPORT_UNLOCK_REQUESTED: id=${id}, by=${userId}, reason="${reason.trim()}"`,
    );
    return result.rows[0];
  }

  /**
   * Phase GOV-E: Deny unlock request (Admin only).
   * Clears unlock request fields.
   */
  async denyQuarterlyReportUnlock(
    id: string,
    adminId: string,
    user: JwtPayload,
  ): Promise<any> {
    if (!this.permissionResolver.isAdmin(user)) {
      throw new ForbiddenException('Only Admin can deny unlock requests');
    }

    const report = await this.findOneQuarterlyReport(id);

    if (!report.unlock_requested_by) {
      throw new BadRequestException('No pending unlock request for this report');
    }

    const result = await this.db.query(
      `UPDATE quarterly_reports
       SET unlock_requested_by = NULL,
           unlock_requested_at = NULL,
           unlock_request_reason = NULL,
           updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id],
    );

    this.logger.log(
      `QUARTERLY_REPORT_UNLOCK_DENIED: id=${id}, by=${adminId}`,
    );
    return result.rows[0];
  }

  /**
   * Phase GOV-F: Find quarterly reports with pending unlock requests (Admin review queue).
   */
  async findQuarterlyReportsPendingUnlock(user: JwtPayload): Promise<any[]> {
    if (!this.isAdmin(user)) {
      throw new ForbiddenException('Only Admin can view pending unlock requests');
    }

    if (!user.is_superadmin) {
      const accessCheck = await this.db.query(
        `SELECT 1 FROM user_module_assignments
         WHERE user_id = $1
           AND (module = 'OPERATIONS' OR module = 'ALL')`,
        [user.sub],
      );
      if (accessCheck.rows.length === 0) {
        return [];
      }
    }

    const result = await this.db.query(
      `SELECT qr.id, qr.fiscal_year, qr.quarter, qr.title, qr.publication_status,
              qr.unlock_requested_by, qr.unlock_requested_at, qr.unlock_request_reason,
              qr.created_at,
              u.first_name || ' ' || u.last_name as requester_name
       FROM quarterly_reports qr
       LEFT JOIN users u ON qr.unlock_requested_by = u.id
       WHERE qr.unlock_requested_by IS NOT NULL
         AND qr.deleted_at IS NULL
       ORDER BY qr.unlock_requested_at ASC`,
    );
    return result.rows;
  }

  /**
   * Phase GOV-C: Find reviewed quarterly reports (PUBLISHED/REJECTED) for admin archive view.
   */
  async findQuarterlyReportsReviewed(user: JwtPayload): Promise<any[]> {
    if (!this.isAdmin(user)) {
      throw new ForbiddenException('Only Admin can view review history');
    }

    if (!user.is_superadmin) {
      const accessCheck = await this.db.query(
        `SELECT 1 FROM user_module_assignments
         WHERE user_id = $1
           AND (module = 'OPERATIONS' OR module = 'ALL')`,
        [user.sub],
      );
      if (accessCheck.rows.length === 0) {
        return [];
      }
    }

    const result = await this.db.query(
      `SELECT qr.id, qr.fiscal_year, qr.quarter, qr.title, qr.publication_status,
              qr.submitted_by, qr.submitted_at,
              qr.reviewed_by, qr.reviewed_at, qr.review_notes,
              qr.unlocked_by, qr.unlocked_at,
              reviewer.first_name || ' ' || reviewer.last_name AS reviewed_by_name,
              submitter.first_name || ' ' || submitter.last_name AS submitter_name,
              unlocker.first_name || ' ' || unlocker.last_name AS unlocked_by_name
       FROM quarterly_reports qr
       LEFT JOIN users reviewer ON qr.reviewed_by = reviewer.id
       LEFT JOIN users submitter ON qr.submitted_by = submitter.id
       LEFT JOIN users unlocker ON qr.unlocked_by = unlocker.id
       WHERE qr.publication_status IN ('PUBLISHED', 'REJECTED')
         AND qr.deleted_at IS NULL
       ORDER BY qr.reviewed_at DESC NULLS LAST`,
    );
    return result.rows;
  }

  /**
   * Phase GOV-D: Find submission history events for quarterly reports.
   * Returns the append-only event log for admin archive/audit view.
   */
  async findSubmissionHistory(user: JwtPayload, fiscalYear?: number, quarter?: string): Promise<any[]> {
    if (!this.isAdmin(user)) {
      throw new ForbiddenException('Only Admin can view submission history');
    }

    if (!user.is_superadmin) {
      const accessCheck = await this.db.query(
        `SELECT 1 FROM user_module_assignments
         WHERE user_id = $1
           AND (module = 'OPERATIONS' OR module = 'ALL')`,
        [user.sub],
      );
      if (accessCheck.rows.length === 0) {
        return [];
      }
    }

    let query = `
      SELECT qrs.id, qrs.quarterly_report_id, qrs.fiscal_year, qrs.quarter,
             qrs.version, qrs.event_type,
             qrs.submitted_by, qrs.submitted_at,
             qrs.reviewed_by, qrs.reviewed_at, qrs.review_notes,
             qrs.actioned_by, qrs.actioned_at, qrs.reason,
             qr.title, qr.publication_status AS current_status,
             submitter.first_name || ' ' || submitter.last_name AS submitter_name,
             reviewer.first_name || ' ' || reviewer.last_name AS reviewed_by_name,
             actor.first_name || ' ' || actor.last_name AS actioned_by_name
      FROM quarterly_report_submissions qrs
      JOIN quarterly_reports qr ON qrs.quarterly_report_id = qr.id
      LEFT JOIN users submitter ON qrs.submitted_by = submitter.id
      LEFT JOIN users reviewer ON qrs.reviewed_by = reviewer.id
      LEFT JOIN users actor ON qrs.actioned_by = actor.id
      WHERE qr.deleted_at IS NULL`;

    const params: any[] = [];
    if (fiscalYear) {
      params.push(fiscalYear);
      query += ` AND qrs.fiscal_year = $${params.length}`;
    }
    if (quarter) {
      params.push(quarter);
      query += ` AND qrs.quarter = $${params.length}`;
    }

    query += ` ORDER BY qrs.actioned_at DESC`;

    const result = await this.db.query(query, params);
    return result.rows;
  }
}
