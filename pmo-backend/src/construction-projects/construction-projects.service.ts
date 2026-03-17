import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../database/database.service';
import { createPaginatedResponse, PaginatedResponse } from '../common/dto';
import {
  CreateConstructionProjectDto,
  UpdateConstructionProjectDto,
  QueryConstructionProjectDto,
  CreateMilestoneDto,
  CreateConstructionFinancialDto,
  CreateGalleryDto,
  QueryGalleryDto,
} from './dto';
import { UploadsService } from '../uploads/uploads.service';
import { JwtPayload } from '../common/interfaces';
import { PermissionResolverService } from '../common/services';

// Publication status values matching database enum
export type PublicationStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED';

@Injectable()
export class ConstructionProjectsService {
  private readonly logger = new Logger(ConstructionProjectsService.name);
  private readonly ALLOWED_SORTS = ['created_at', 'title', 'status', 'start_date', 'target_completion_date', 'physical_progress'];

  constructor(
    private readonly db: DatabaseService,
    private readonly uploadsService: UploadsService,
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
    // Delete existing assignments
    await this.db.query(
      `DELETE FROM record_assignments WHERE module = 'CONSTRUCTION' AND record_id = $1`,
      [recordId],
    );
    // Insert new assignments
    for (const userId of userIds) {
      await this.db.query(
        `INSERT INTO record_assignments (module, record_id, user_id) VALUES ('CONSTRUCTION', $1, $2)
         ON CONFLICT (module, record_id, user_id) DO NOTHING`,
        [recordId, userId],
      );
    }
  }

  /**
   * Phase AT: Get assigned user IDs from junction table
   */
  private async getRecordAssignments(recordId: string): Promise<string[]> {
    const result = await this.db.query(
      `SELECT user_id FROM record_assignments WHERE module = 'CONSTRUCTION' AND record_id = $1`,
      [recordId],
    );
    return result.rows.map((row: any) => row.user_id);
  }

  /**
   * Phase AT: Check if user is assigned to record via junction table
   */
  private async isUserAssigned(recordId: string, userId: string): Promise<boolean> {
    const result = await this.db.query(
      `SELECT 1 FROM record_assignments WHERE module = 'CONSTRUCTION' AND record_id = $1 AND user_id = $2`,
      [recordId, userId],
    );
    return result.rows.length > 0;
  }

  async findAll(query: QueryConstructionProjectDto, user?: JwtPayload): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20, sort = 'created_at', order = 'desc' } = query;
    const offset = (page - 1) * limit;

    const sortColumn = this.ALLOWED_SORTS.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const conditions: string[] = ['cp.deleted_at IS NULL'];
    const params: any[] = [];
    let paramIndex = 1;

    // Phase X: Visibility filter by role
    // Admin: sees all records
    // Non-admin: sees all PUBLISHED records + own records in any status
    const queryAny = query as any;
    if (queryAny.publication_status) {
      if (queryAny.publication_status !== 'PUBLISHED' && user && !this.isAdmin(user)) {
        // Non-admin filtering by non-PUBLISHED: only show own records in that status
        conditions.push(`(cp.publication_status = $${paramIndex} AND cp.created_by = $${paramIndex + 1})`);
        paramIndex += 2;
        params.push(queryAny.publication_status, user.sub);
      } else {
        conditions.push(`cp.publication_status = $${paramIndex++}`);
        params.push(queryAny.publication_status);
      }
    } else if (user && !this.isAdmin(user)) {
      // Phase Y + AM + AT: Campus-scoped visibility with junction table for assignments
      const recordCampus = this.normalizeUserCampusToRecordCampus(user.campus);
      if (recordCampus) {
        // With mapped campus: records from user's campus + own records + assigned records (via junction)
        conditions.push(`(cp.campus = $${paramIndex} OR cp.created_by = $${paramIndex + 1} OR EXISTS (SELECT 1 FROM record_assignments ra WHERE ra.module = 'CONSTRUCTION' AND ra.record_id = cp.id AND ra.user_id = $${paramIndex + 1}))`);
        params.push(recordCampus, user.sub);
        paramIndex += 2;
      } else {
        // Without campus (or unmapped): PUBLISHED + own records + assigned records (via junction)
        conditions.push(`(cp.publication_status = 'PUBLISHED' OR cp.created_by = $${paramIndex} OR EXISTS (SELECT 1 FROM record_assignments ra WHERE ra.module = 'CONSTRUCTION' AND ra.record_id = cp.id AND ra.user_id = $${paramIndex}))`);
        params.push(user.sub);
        paramIndex++;
      }
    }
    // Admin with no filter sees all statuses

    if (query.status) {
      conditions.push(`cp.status = $${paramIndex++}`);
      params.push(query.status);
    }
    if (query.campus) {
      conditions.push(`cp.campus = $${paramIndex++}`);
      params.push(query.campus);
    }
    if (query.contractor_id) {
      conditions.push(`cp.contractor_id = $${paramIndex++}`);
      params.push(query.contractor_id);
    }
    if (query.funding_source_id) {
      conditions.push(`cp.funding_source_id = $${paramIndex++}`);
      params.push(query.funding_source_id);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query(
      `SELECT COUNT(*) FROM construction_projects cp WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await this.db.query(
      `SELECT cp.id, cp.infra_project_uid, cp.project_id, cp.project_code, cp.title,
              cp.description, cp.status, cp.campus, cp.start_date, cp.target_completion_date,
              cp.physical_progress, cp.financial_progress, cp.contract_amount,
              cp.contractor_id, cp.funding_source_id, cp.publication_status, cp.created_at,
              cp.submitted_by, cp.submitted_at,
              submitter.first_name || ' ' || submitter.last_name as submitted_by_name,
              (SELECT COALESCE(json_agg(json_build_object('id', u.id, 'name', u.first_name || ' ' || u.last_name)), '[]'::json)
               FROM record_assignments ra JOIN users u ON ra.user_id = u.id
               WHERE ra.module = 'CONSTRUCTION' AND ra.record_id = cp.id) as assigned_users
       FROM construction_projects cp
       LEFT JOIN users submitter ON cp.submitted_by = submitter.id
       WHERE ${whereClause}
       ORDER BY cp.${sortColumn} ${sortOrder}
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset],
    );

    return createPaginatedResponse(dataResult.rows, total, page, limit);
  }

  async findOne(id: string): Promise<any> {
    const result = await this.db.query(
      `SELECT cp.*,
              p.title as project_title, p.project_type,
              c.name as contractor_name,
              fs.name as funding_source_name,
              creator.first_name || ' ' || creator.last_name as created_by_name,
              submitter.first_name || ' ' || submitter.last_name as submitted_by_name,
              reviewer.first_name || ' ' || reviewer.last_name as reviewed_by_name,
              (SELECT COALESCE(json_agg(json_build_object('id', u.id, 'name', u.first_name || ' ' || u.last_name)), '[]'::json)
               FROM record_assignments ra JOIN users u ON ra.user_id = u.id
               WHERE ra.module = 'CONSTRUCTION' AND ra.record_id = cp.id) as assigned_users
       FROM construction_projects cp
       LEFT JOIN projects p ON cp.project_id = p.id
       LEFT JOIN contractors c ON cp.contractor_id = c.id
       LEFT JOIN funding_sources fs ON cp.funding_source_id = fs.id
       LEFT JOIN users creator ON cp.created_by = creator.id
       LEFT JOIN users submitter ON cp.submitted_by = submitter.id
       LEFT JOIN users reviewer ON cp.reviewed_by = reviewer.id
       WHERE cp.id = $1 AND cp.deleted_at IS NULL`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Construction project with ID ${id} not found`);
    }

    const project = result.rows[0];

    // Get milestones
    const milestones = await this.db.query(
      `SELECT * FROM construction_milestones WHERE project_id = $1 ORDER BY target_date`,
      [id],
    );

    // Get financials
    const financials = await this.db.query(
      `SELECT * FROM construction_project_financials WHERE project_id = $1 AND deleted_at IS NULL ORDER BY fiscal_year DESC`,
      [id],
    );

    return {
      ...project,
      milestones: milestones.rows,
      financials: financials.rows,
    };
  }

  async create(dto: CreateConstructionProjectDto, userId: string, user?: JwtPayload): Promise<any> {
    // Check for duplicate project_code
    const existing = await this.db.query(
      `SELECT id FROM construction_projects WHERE project_code = $1 AND deleted_at IS NULL`,
      [dto.project_code],
    );
    if (existing.rows.length > 0) {
      throw new ConflictException(`Project code ${dto.project_code} already exists`);
    }

    // Generate project_id if not provided (Domain-Driven Creation pattern)
    const projectId = dto.project_id || uuidv4();

    // Universal Draft Governance: ALL users create DRAFT
    // Publishing requires explicit approval action via POST /:id/publish endpoint
    const publicationStatus: PublicationStatus = 'DRAFT';
    const submittedBy = userId;  // Always track submitter for audit trail
    const submittedAt = new Date();  // Always track submission time

    // Begin atomic transaction
    await this.db.query('BEGIN');
    try {
      // If project_id was not provided, create base projects record first
      if (!dto.project_id) {
        await this.db.query(
          `INSERT INTO projects (id, project_code, title, description, project_type, start_date, end_date, status, budget, campus, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            projectId,
            dto.project_code,
            dto.title,
            dto.description || null,
            'CONSTRUCTION',
            dto.start_date || null,
            dto.target_completion_date || null,
            dto.status,
            dto.contract_amount || null,
            dto.campus,
            userId,
          ],
        );
      } else {
        // Verify provided project_id exists
        const projectCheck = await this.db.query(
          `SELECT id FROM projects WHERE id = $1 AND deleted_at IS NULL`,
          [dto.project_id],
        );
        if (projectCheck.rows.length === 0) {
          throw new BadRequestException(`Project with ID ${dto.project_id} not found`);
        }
      }

      // Create construction_projects record with publication_status
      // Phase AN: Include assigned_to for inline assignment during creation
      const result = await this.db.query(
        `INSERT INTO construction_projects
         (project_id, project_code, title, description, ideal_infrastructure_image, beneficiaries,
          objectives, key_features, original_contract_duration, contract_number, contractor_id,
          contract_amount, start_date, target_completion_date, project_duration, project_engineer,
          project_manager, building_type, floor_area, number_of_floors, funding_source_id,
          subcategory_id, campus, status, latitude, longitude, metadata, created_by,
          publication_status, submitted_by, submitted_at, assigned_to)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32)
         RETURNING *`,
        [
          projectId,
          dto.project_code,
          dto.title,
          dto.description,
          dto.ideal_infrastructure_image,
          dto.beneficiaries,
          dto.objectives ? JSON.stringify(dto.objectives) : null,
          dto.key_features ? JSON.stringify(dto.key_features) : null,
          dto.original_contract_duration,
          dto.contract_number,
          dto.contractor_id,
          dto.contract_amount,
          dto.start_date,
          dto.target_completion_date,
          dto.project_duration,
          dto.project_engineer,
          dto.project_manager,
          dto.building_type,
          dto.floor_area,
          dto.number_of_floors,
          dto.funding_source_id,
          dto.subcategory_id,
          dto.campus,
          dto.status,
          dto.latitude,
          dto.longitude,
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

      await this.db.query('COMMIT');
      this.logger.log(`CONSTRUCTION_PROJECT_CREATED: id=${recordId}, status=${publicationStatus}, by=${userId}`);
      return result.rows[0];
    } catch (error) {
      await this.db.query('ROLLBACK');
      throw error;
    }
  }

  async update(id: string, dto: UpdateConstructionProjectDto, userId: string, user?: JwtPayload): Promise<any> {
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

    const dtoAny = dto as any;
    if (dtoAny.project_code) {
      const existing = await this.db.query(
        `SELECT id FROM construction_projects WHERE project_code = $1 AND id != $2 AND deleted_at IS NULL`,
        [dtoAny.project_code, id],
      );
      if (existing.rows.length > 0) {
        throw new ConflictException(`Project code ${dtoAny.project_code} already exists`);
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

    const fields = Object.keys(dto).filter((k) => dto[k] !== undefined && k !== 'assigned_user_ids');
    if (fields.length === 0 && !requiresStatusReset) {
      return this.findOne(id);
    }

    const jsonFields = ['objectives', 'key_features', 'metadata'];
    let setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map((f) => (jsonFields.includes(f) ? JSON.stringify(dto[f]) : dto[f]));

    // Apply status reset fields based on prior status
    if (requiresStatusReset) {
      let resetFields: string[];
      if (priorStatus === 'PENDING_REVIEW') {
        // Submission cancelled: clear submitted metadata
        resetFields = [
          `publication_status = 'DRAFT'`,
          `submitted_by = NULL`,
          `submitted_at = NULL`,
        ];
      } else {
        // PUBLISHED or REJECTED: clear review metadata, track who triggered reset
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
      `UPDATE construction_projects
       SET ${setClause}, updated_by = $${values.length + 1}, updated_at = NOW()
       WHERE id = $${values.length + 2} AND deleted_at IS NULL
       RETURNING *`,
      [...values, userId, id],
    );

    // Phase AT: Handle multi-select assignments via junction table
    if (dto.assigned_user_ids !== undefined) {
      await this.updateRecordAssignments(id, dto.assigned_user_ids || []);
    }

    this.logger.log(`CONSTRUCTION_PROJECT_UPDATED: id=${id}, by=${userId}, fields=[${fields.join(',')}]${requiresStatusReset ? `, status_reset=DRAFT (was=${priorStatus})` : ''}`);
    return this.findOne(id);  // Return fresh data with assigned_users
  }

  async remove(id: string, userId: string): Promise<void> {
    const project = await this.findOne(id);

    // Begin atomic transaction to delete both domain and base records
    await this.db.query('BEGIN');
    try {
      // Soft delete construction_projects record
      await this.db.query(
        `UPDATE construction_projects SET deleted_at = NOW(), deleted_by = $1 WHERE id = $2`,
        [userId, id],
      );

      // Soft delete base projects record
      await this.db.query(
        `UPDATE projects SET deleted_at = NOW(), deleted_by = $1 WHERE id = $2`,
        [userId, project.project_id],
      );

      await this.db.query('COMMIT');
      this.logger.log(`CONSTRUCTION_PROJECT_DELETED: id=${id}, by=${userId}`);
    } catch (error) {
      await this.db.query('ROLLBACK');
      throw error;
    }
  }

  // --- Draft Governance Workflow ---

  /**
   * Submit a draft for admin review
   * Can only be called by the draft owner (Staff)
   */
  async submitForReview(id: string, userId: string): Promise<any> {
    const project = await this.findOne(id);

    if (project.publication_status !== 'DRAFT' && project.publication_status !== 'REJECTED') {
      throw new BadRequestException(
        `Only DRAFT or REJECTED records can be submitted for review. Current status: ${project.publication_status}`,
      );
    }

    // Phase BU: Creator OR assigned user (via junction table) can submit for review
    const isOwner = project.created_by === userId;
    const isAssigned = await this.isUserAssigned(id, userId);
    if (!isOwner && !isAssigned) {
      throw new ForbiddenException('Only the creator or assigned user can submit this draft for review');
    }

    const result = await this.db.query(
      `UPDATE construction_projects
       SET publication_status = 'PENDING_REVIEW',
           submitted_by = $1,
           submitted_at = NOW(),
           review_notes = NULL,
           updated_at = NOW()
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [userId, id],
    );

    this.logger.log(`CONSTRUCTION_PROJECT_SUBMITTED_FOR_REVIEW: id=${id}, by=${userId}`);
    return result.rows[0];
  }

  /**
   * Publish (approve) a pending draft
   * Admin only
   */
  async publish(id: string, adminId: string, user: JwtPayload): Promise<any> {
    if (!this.permissionResolver.isAdmin(user)) {
      throw new ForbiddenException('Only Admin can publish records');
    }

    const project = await this.findOne(id);

    // Centralized rank-based approval check (includes self-approval prevention)
    const approvalCheck = await this.permissionResolver.canApproveByRank(
      adminId,
      project.created_by,
      user.is_superadmin,
    );
    if (!approvalCheck.allowed) {
      throw new ForbiddenException(approvalCheck.reason);
    }

    // Universal Draft Governance: Only PENDING_REVIEW records can be published
    // DRAFT must first be submitted for review via POST /:id/submit-for-review
    if (project.publication_status !== 'PENDING_REVIEW') {
      throw new BadRequestException(
        `Only PENDING_REVIEW records can be published. Current status: ${project.publication_status}. ` +
        `DRAFT records must first be submitted for review via POST /:id/submit-for-review.`
      );
    }

    const result = await this.db.query(
      `UPDATE construction_projects
       SET publication_status = 'PUBLISHED',
           reviewed_by = $1,
           reviewed_at = NOW(),
           review_notes = NULL,
           updated_at = NOW()
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [adminId, id],
    );

    this.logger.log(`CONSTRUCTION_PROJECT_PUBLISHED: id=${id}, by=${adminId}`);
    return result.rows[0];
  }

  /**
   * Reject a pending draft with notes
   * Admin only
   */
  async reject(id: string, adminId: string, notes: string, user: JwtPayload): Promise<any> {
    if (!this.isAdmin(user)) {
      throw new ForbiddenException('Only Admin can reject records');
    }

    const project = await this.findOne(id);

    if (project.publication_status !== 'PENDING_REVIEW') {
      throw new BadRequestException(
        `Only PENDING_REVIEW records can be rejected. Current status: ${project.publication_status}`,
      );
    }

    if (!notes || notes.trim().length === 0) {
      throw new BadRequestException('Rejection notes are required');
    }

    const result = await this.db.query(
      `UPDATE construction_projects
       SET publication_status = 'REJECTED',
           reviewed_by = $1,
           reviewed_at = NOW(),
           review_notes = $2,
           updated_at = NOW()
       WHERE id = $3 AND deleted_at IS NULL
       RETURNING *`,
      [adminId, notes.trim(), id],
    );

    this.logger.log(`CONSTRUCTION_PROJECT_REJECTED: id=${id}, by=${adminId}`);
    return result.rows[0];
  }

  /**
   * Withdraw a pending submission (return to DRAFT)
   * Only the original submitter can withdraw their own submission
   */
  async withdraw(id: string, userId: string): Promise<any> {
    const project = await this.findOne(id);

    // Can only withdraw PENDING_REVIEW records
    if (project.publication_status !== 'PENDING_REVIEW') {
      throw new BadRequestException(
        `Only PENDING_REVIEW records can be withdrawn. Current status: ${project.publication_status}`,
      );
    }

    // Only the original submitter can withdraw
    if (project.submitted_by !== userId) {
      throw new ForbiddenException('Only the original submitter can withdraw this submission');
    }

    const result = await this.db.query(
      `UPDATE construction_projects
       SET publication_status = 'DRAFT',
           submitted_by = NULL,
           submitted_at = NULL,
           updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id],
    );

    this.logger.log(`CONSTRUCTION_PROJECT_WITHDRAWN: id=${id}, by=${userId}`);
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

    // Check module access (SuperAdmin or user with CONSTRUCTION/ALL assignment)
    if (!user.is_superadmin) {
      const accessCheck = await this.db.query(
        `SELECT 1 FROM user_module_assignments
         WHERE user_id = $1
           AND (module = 'CONSTRUCTION' OR module = 'ALL')`,
        [user.sub],
      );

      if (accessCheck.rows.length === 0) {
        return []; // No access to this module
      }
    }

    const result = await this.db.query(
      `SELECT cp.id, cp.project_code, cp.title, cp.campus, cp.publication_status,
              cp.submitted_by, cp.submitted_at, cp.created_at,
              u.first_name || ' ' || u.last_name as submitter_name
       FROM construction_projects cp
       LEFT JOIN users u ON cp.submitted_by = u.id
       WHERE cp.publication_status = 'PENDING_REVIEW'
         AND cp.deleted_at IS NULL
       ORDER BY cp.submitted_at ASC`,
    );

    return result.rows;
  }

  /**
   * Get user's own drafts (Staff view)
   */
  async findMyDrafts(userId: string): Promise<any[]> {
    const result = await this.db.query(
      `SELECT id, project_code, title, campus, publication_status,
              submitted_at, review_notes, created_at
       FROM construction_projects
       WHERE created_by = $1
         AND publication_status IN ('DRAFT', 'PENDING_REVIEW', 'REJECTED')
         AND deleted_at IS NULL
       ORDER BY created_at DESC`,
      [userId],
    );

    return result.rows;
  }

  // --- Milestones ---
  async findMilestones(projectId: string): Promise<any[]> {
    await this.findOne(projectId);
    const result = await this.db.query(
      `SELECT * FROM construction_milestones WHERE project_id = $1 ORDER BY target_date`,
      [projectId],
    );
    return result.rows;
  }

  async createMilestone(projectId: string, dto: CreateMilestoneDto): Promise<any> {
    await this.findOne(projectId);

    const result = await this.db.query(
      `INSERT INTO construction_milestones (project_id, title, description, target_date, status, remarks)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [projectId, dto.title, dto.description, dto.target_date, dto.status || 'PENDING', dto.remarks],
    );

    this.logger.log(`MILESTONE_CREATED: id=${result.rows[0].id}, project=${projectId}`);
    return result.rows[0];
  }

  async updateMilestone(projectId: string, milestoneId: string, dto: Partial<CreateMilestoneDto>): Promise<any> {
    await this.findOne(projectId);

    const check = await this.db.query(
      `SELECT id FROM construction_milestones WHERE id = $1 AND project_id = $2`,
      [milestoneId, projectId],
    );
    if (check.rows.length === 0) {
      throw new NotFoundException(`Milestone ${milestoneId} not found`);
    }

    const fields = Object.keys(dto).filter((k) => dto[k] !== undefined);
    if (fields.length === 0) {
      const current = await this.db.query(`SELECT * FROM construction_milestones WHERE id = $1`, [milestoneId]);
      return current.rows[0];
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map((f) => dto[f]);

    const result = await this.db.query(
      `UPDATE construction_milestones SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, milestoneId],
    );

    this.logger.log(`MILESTONE_UPDATED: id=${milestoneId}`);
    return result.rows[0];
  }

  async removeMilestone(projectId: string, milestoneId: string): Promise<void> {
    await this.findOne(projectId);

    const result = await this.db.query(
      `DELETE FROM construction_milestones WHERE id = $1 AND project_id = $2`,
      [milestoneId, projectId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException(`Milestone ${milestoneId} not found`);
    }

    this.logger.log(`MILESTONE_DELETED: id=${milestoneId}`);
  }

  // --- Financials ---
  async findFinancials(projectId: string, fiscalYear?: number): Promise<any[]> {
    await this.findOne(projectId);

    let query = `SELECT * FROM construction_project_financials WHERE project_id = $1 AND deleted_at IS NULL`;
    const params: any[] = [projectId];

    if (fiscalYear) {
      query += ` AND fiscal_year = $2`;
      params.push(fiscalYear);
    }

    query += ` ORDER BY fiscal_year DESC`;

    const result = await this.db.query(query, params);
    return result.rows;
  }

  async createFinancial(projectId: string, dto: CreateConstructionFinancialDto, userId: string): Promise<any> {
    await this.findOne(projectId);

    const result = await this.db.query(
      `INSERT INTO construction_project_financials (project_id, fiscal_year, appropriation, obligation, disbursement, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [projectId, dto.fiscal_year, dto.appropriation, dto.obligation, dto.disbursement || 0, dto.metadata ? JSON.stringify(dto.metadata) : null],
    );

    this.logger.log(`CONSTRUCTION_FINANCIAL_CREATED: id=${result.rows[0].id}, project=${projectId}, by=${userId}`);
    return result.rows[0];
  }

  async updateFinancial(projectId: string, financialId: string, dto: Partial<CreateConstructionFinancialDto>, userId: string): Promise<any> {
    await this.findOne(projectId);

    const check = await this.db.query(
      `SELECT id FROM construction_project_financials WHERE id = $1 AND project_id = $2 AND deleted_at IS NULL`,
      [financialId, projectId],
    );
    if (check.rows.length === 0) {
      throw new NotFoundException(`Financial record ${financialId} not found`);
    }

    const fields = Object.keys(dto).filter((k) => dto[k] !== undefined);
    if (fields.length === 0) {
      const current = await this.db.query(`SELECT * FROM construction_project_financials WHERE id = $1`, [financialId]);
      return current.rows[0];
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map((f) => (f === 'metadata' ? JSON.stringify(dto[f]) : dto[f]));

    const result = await this.db.query(
      `UPDATE construction_project_financials SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, financialId],
    );

    this.logger.log(`CONSTRUCTION_FINANCIAL_UPDATED: id=${financialId}, by=${userId}`);
    return result.rows[0];
  }

  async removeFinancial(projectId: string, financialId: string, userId: string): Promise<void> {
    await this.findOne(projectId);

    const result = await this.db.query(
      `UPDATE construction_project_financials SET deleted_at = NOW() WHERE id = $1 AND project_id = $2 AND deleted_at IS NULL`,
      [financialId, projectId],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException(`Financial record ${financialId} not found`);
    }

    this.logger.log(`CONSTRUCTION_FINANCIAL_DELETED: id=${financialId}, by=${userId}`);
  }

  // --- Gallery ---
  async findGallery(projectId: string, query: QueryGalleryDto): Promise<PaginatedResponse<any>> {
    await this.findOne(projectId);

    const { page = 1, limit = 20, sort = 'uploaded_at', order = 'desc' } = query;
    const offset = (page - 1) * limit;

    // Schema columns: id, project_id, image_url, caption, category, is_featured, uploaded_at
    const sortColumn = ['uploaded_at', 'category'].includes(sort) ? sort : 'uploaded_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const conditions: string[] = ['project_id = $1'];
    const params: any[] = [projectId];
    let paramIndex = 2;

    if (query.category) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(query.category);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query(
      `SELECT COUNT(*) FROM construction_gallery WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await this.db.query(
      `SELECT id, project_id, image_url, caption, category, is_featured, uploaded_at
       FROM construction_gallery
       WHERE ${whereClause}
       ORDER BY ${sortColumn} ${sortOrder}
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset],
    );

    return createPaginatedResponse(dataResult.rows, total, page, limit);
  }

  async findGalleryItem(projectId: string, galleryId: string): Promise<any> {
    await this.findOne(projectId);

    const result = await this.db.query(
      `SELECT id, project_id, image_url, caption, category, is_featured, uploaded_at
       FROM construction_gallery WHERE id = $1 AND project_id = $2`,
      [galleryId, projectId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Gallery item ${galleryId} not found`);
    }

    return result.rows[0];
  }

  async createGalleryItem(
    projectId: string,
    file: Express.Multer.File,
    dto: CreateGalleryDto,
    userId: string,
  ): Promise<any> {
    await this.findOne(projectId);

    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    // Upload file using uploads service
    const uploadResult = await this.uploadsService.uploadFile(
      file,
      userId,
      'construction_gallery',
      projectId,
    );

    // Schema columns: project_id, image_url, caption, category, is_featured
    // image_url is populated from upload file path
    const result = await this.db.query(
      `INSERT INTO construction_gallery
       (project_id, image_url, caption, category, is_featured)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, project_id, image_url, caption, category, is_featured, uploaded_at`,
      [
        projectId,
        uploadResult.filePath,
        dto.caption || null,
        dto.category || 'PROGRESS',
        dto.is_featured || false,
      ],
    );

    this.logger.log(`GALLERY_CREATED: id=${result.rows[0].id}, project=${projectId}, by=${userId}`);
    return result.rows[0];
  }

  async updateGalleryItem(
    projectId: string,
    galleryId: string,
    dto: Partial<CreateGalleryDto>,
    userId: string,
  ): Promise<any> {
    await this.findGalleryItem(projectId, galleryId);

    // Schema updatable columns: caption, category, is_featured
    const allowedFields = ['caption', 'category', 'is_featured'];
    const fields = Object.keys(dto).filter((k) => allowedFields.includes(k) && dto[k] !== undefined);

    if (fields.length === 0) {
      return this.findGalleryItem(projectId, galleryId);
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map((f) => dto[f]);

    const result = await this.db.query(
      `UPDATE construction_gallery SET ${setClause} WHERE id = $${fields.length + 1}
       RETURNING id, project_id, image_url, caption, category, is_featured, uploaded_at`,
      [...values, galleryId],
    );

    this.logger.log(`GALLERY_UPDATED: id=${galleryId}, by=${userId}`);
    return result.rows[0];
  }

  async removeGalleryItem(projectId: string, galleryId: string, userId: string): Promise<void> {
    const gallery = await this.findGalleryItem(projectId, galleryId);

    // Delete the file from storage (image_url contains file path)
    if (gallery.image_url) {
      await this.uploadsService.deleteFile(gallery.image_url);
    }

    // Hard delete - schema has no soft delete columns for construction_gallery
    await this.db.query(
      `DELETE FROM construction_gallery WHERE id = $1`,
      [galleryId],
    );

    this.logger.log(`GALLERY_DELETED: id=${galleryId}, by=${userId}`);
  }
}
