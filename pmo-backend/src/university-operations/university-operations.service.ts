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
  CreateFinancialDto,
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
              uo.submitted_by, uo.submitted_at,
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
    const result = await this.db.query(
      `INSERT INTO university_operations
       (operation_type, title, description, code, start_date, end_date, status, budget, campus, coordinator_id, metadata, created_by,
        publication_status, submitted_by, submitted_at, assigned_to)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
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

    // Phase AD: Creator OR assigned user can submit for review
    const isOwner = operation.created_by === userId;
    const isAssigned = operation.assigned_to === userId;
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
  async findIndicators(operationId: string, fiscalYear?: number): Promise<any[]> {
    await this.findOne(operationId);

    let query = `SELECT * FROM operation_indicators WHERE operation_id = $1 AND deleted_at IS NULL`;
    const params: any[] = [operationId];

    if (fiscalYear) {
      query += ` AND fiscal_year = $2`;
      params.push(fiscalYear);
    }

    query += ` ORDER BY fiscal_year DESC, created_at DESC`;

    const result = await this.db.query(query, params);
    return result.rows;
  }

  async createIndicator(operationId: string, dto: CreateIndicatorDto, userId: string): Promise<any> {
    await this.findOne(operationId);

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

  async updateIndicator(operationId: string, indicatorId: string, dto: Partial<CreateIndicatorDto>, userId: string): Promise<any> {
    await this.findOne(operationId);

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

  async removeIndicator(operationId: string, indicatorId: string, userId: string): Promise<void> {
    await this.findOne(operationId);

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
  async findFinancials(operationId: string, fiscalYear?: number, quarter?: string): Promise<any[]> {
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

    query += ` ORDER BY fiscal_year DESC, quarter`;

    const result = await this.db.query(query, params);
    return result.rows;
  }

  async createFinancial(operationId: string, dto: CreateFinancialDto, userId: string): Promise<any> {
    await this.findOne(operationId);

    const result = await this.db.query(
      `INSERT INTO operation_financials
       (operation_id, fiscal_year, quarter, operations_programs, department, budget_source,
        allotment, target, obligation, disbursement, performance_indicator, remarks, metadata, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        operationId,
        dto.fiscal_year,
        dto.quarter,
        dto.operations_programs,
        dto.department,
        dto.budget_source,
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
    return result.rows[0];
  }

  async updateFinancial(operationId: string, financialId: string, dto: Partial<CreateFinancialDto>, userId: string): Promise<any> {
    await this.findOne(operationId);

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
      return current.rows[0];
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
    return result.rows[0];
  }

  async removeFinancial(operationId: string, financialId: string, userId: string): Promise<void> {
    await this.findOne(operationId);

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
}
