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
import { ProjectStatus, RepairStatus } from '../common/enums';
import {
  CreateRepairProjectDto,
  UpdateRepairProjectDto,
  QueryRepairProjectDto,
  CreatePowItemDto,
  CreatePhaseDto,
  CreateTeamMemberDto,
} from './dto';
import { JwtPayload } from '../common/interfaces';
import { PermissionResolverService } from '../common/services';

// Publication status values matching database enum
export type PublicationStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED';

@Injectable()
export class RepairProjectsService {
  private readonly logger = new Logger(RepairProjectsService.name);
  private readonly ALLOWED_SORTS = ['created_at', 'title', 'status', 'urgency_level', 'start_date', 'reported_date', 'physical_progress'];

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
      `DELETE FROM record_assignments WHERE module = 'REPAIR' AND record_id = $1`,
      [recordId],
    );
    for (const userId of userIds) {
      await this.db.query(
        `INSERT INTO record_assignments (module, record_id, user_id) VALUES ('REPAIR', $1, $2)
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
      `SELECT 1 FROM record_assignments WHERE module = 'REPAIR' AND record_id = $1 AND user_id = $2`,
      [recordId, userId],
    );
    return result.rows.length > 0;
  }

  /**
   * Maps RepairStatus to ProjectStatus for base projects table
   * @param repairStatus - The repair-specific status
   * @returns Corresponding ProjectStatus value
   */
  private mapRepairStatusToProjectStatus(repairStatus: RepairStatus): ProjectStatus {
    switch (repairStatus) {
      case RepairStatus.REPORTED:
      case RepairStatus.INSPECTED:
      case RepairStatus.APPROVED:
        return ProjectStatus.PLANNING;
      case RepairStatus.IN_PROGRESS:
        return ProjectStatus.ONGOING;
      case RepairStatus.COMPLETED:
        return ProjectStatus.COMPLETED;
      case RepairStatus.CANCELLED:
        return ProjectStatus.CANCELLED;
      default:
        return ProjectStatus.PLANNING;
    }
  }

  async findAll(query: QueryRepairProjectDto, user?: JwtPayload): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20, sort = 'created_at', order = 'desc' } = query;
    const offset = (page - 1) * limit;

    const sortColumn = this.ALLOWED_SORTS.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const conditions: string[] = ['rp.deleted_at IS NULL'];
    const params: any[] = [];
    let paramIndex = 1;

    // Phase X: Visibility filter by role
    // Admin: sees all records. Non-admin: PUBLISHED + own records in any status.
    const queryAny = query as any;
    if (queryAny.publication_status) {
      if (queryAny.publication_status !== 'PUBLISHED' && user && !this.isAdmin(user)) {
        conditions.push(`(rp.publication_status = $${paramIndex} AND rp.created_by = $${paramIndex + 1})`);
        paramIndex += 2;
        params.push(queryAny.publication_status, user.sub);
      } else {
        conditions.push(`rp.publication_status = $${paramIndex++}`);
        params.push(queryAny.publication_status);
      }
    } else if (user && !this.isAdmin(user)) {
      // Phase Y + AM + AT: Campus-scoped visibility with junction table for assignments
      const recordCampus = this.normalizeUserCampusToRecordCampus(user.campus);
      if (recordCampus) {
        // With mapped campus: records from user's campus + own records + assigned records (via junction)
        conditions.push(`(rp.campus = $${paramIndex} OR rp.created_by = $${paramIndex + 1} OR EXISTS (SELECT 1 FROM record_assignments ra WHERE ra.module = 'REPAIR' AND ra.record_id = rp.id AND ra.user_id = $${paramIndex + 1}))`);
        params.push(recordCampus, user.sub);
        paramIndex += 2;
      } else {
        // Without campus (or unmapped): PUBLISHED + own records + assigned records (via junction)
        conditions.push(`(rp.publication_status = 'PUBLISHED' OR rp.created_by = $${paramIndex} OR EXISTS (SELECT 1 FROM record_assignments ra WHERE ra.module = 'REPAIR' AND ra.record_id = rp.id AND ra.user_id = $${paramIndex}))`);
        params.push(user.sub);
        paramIndex++;
      }
    }

    if (query.status) {
      conditions.push(`rp.status = $${paramIndex++}`);
      params.push(query.status);
    }
    if (query.urgency) {
      conditions.push(`rp.urgency_level = $${paramIndex++}`);
      params.push(query.urgency);
    }
    if (query.is_emergency !== undefined) {
      conditions.push(`rp.is_emergency = $${paramIndex++}`);
      params.push(query.is_emergency);
    }
    if (query.campus) {
      conditions.push(`rp.campus = $${paramIndex++}`);
      params.push(query.campus);
    }
    if (query.repair_type_id) {
      conditions.push(`rp.repair_type_id = $${paramIndex++}`);
      params.push(query.repair_type_id);
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await this.db.query(
      `SELECT COUNT(*) FROM repair_projects rp WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const dataResult = await this.db.query(
      `SELECT rp.id, rp.project_id, rp.project_code, rp.title, rp.building_name,
              rp.status, rp.urgency_level, rp.is_emergency, rp.campus,
              rp.start_date, rp.end_date, rp.budget, rp.reported_date, rp.created_at,
              rp.physical_progress, rp.financial_progress, rp.publication_status,
              rp.submitted_by, rp.submitted_at,
              submitter.first_name || ' ' || submitter.last_name as submitted_by_name,
              rt.name as repair_type_name,
              (SELECT COALESCE(json_agg(json_build_object('id', u.id, 'name', u.first_name || ' ' || u.last_name)), '[]'::json)
               FROM record_assignments ra JOIN users u ON ra.user_id = u.id
               WHERE ra.module = 'REPAIR' AND ra.record_id = rp.id) as assigned_users
       FROM repair_projects rp
       LEFT JOIN repair_types rt ON rp.repair_type_id = rt.id
       LEFT JOIN users submitter ON rp.submitted_by = submitter.id
       WHERE ${whereClause}
       ORDER BY rp.${sortColumn} ${sortOrder}
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset],
    );

    return createPaginatedResponse(dataResult.rows, total, page, limit);
  }

  async findOne(id: string): Promise<any> {
    const result = await this.db.query(
      `SELECT rp.*,
              p.title as project_title,
              rt.name as repair_type_name,
              c.name as contractor_name,
              f.building_name as facility_name,
              creator.first_name || ' ' || creator.last_name as created_by_name,
              submitter.first_name || ' ' || submitter.last_name as submitted_by_name,
              reviewer.first_name || ' ' || reviewer.last_name as reviewed_by_name,
              (SELECT COALESCE(json_agg(json_build_object('id', u.id, 'name', u.first_name || ' ' || u.last_name)), '[]'::json)
               FROM record_assignments ra JOIN users u ON ra.user_id = u.id
               WHERE ra.module = 'REPAIR' AND ra.record_id = rp.id) as assigned_users
       FROM repair_projects rp
       LEFT JOIN projects p ON rp.project_id = p.id
       LEFT JOIN repair_types rt ON rp.repair_type_id = rt.id
       LEFT JOIN contractors c ON rp.contractor_id = c.id
       LEFT JOIN facilities f ON rp.facility_id = f.id
       LEFT JOIN users creator ON rp.created_by = creator.id
       LEFT JOIN users submitter ON rp.submitted_by = submitter.id
       LEFT JOIN users reviewer ON rp.reviewed_by = reviewer.id
       WHERE rp.id = $1 AND rp.deleted_at IS NULL`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(`Repair project with ID ${id} not found`);
    }

    const project = result.rows[0];

    // Get POW items
    const powItems = await this.db.query(
      `SELECT * FROM repair_pow_items WHERE repair_project_id = $1 AND deleted_at IS NULL ORDER BY item_number`,
      [id],
    );

    // Get phases
    const phases = await this.db.query(
      `SELECT * FROM repair_project_phases WHERE repair_project_id = $1 AND deleted_at IS NULL ORDER BY created_at`,
      [id],
    );

    // Get team members
    const teamMembers = await this.db.query(
      `SELECT * FROM repair_project_team_members WHERE repair_project_id = $1 AND deleted_at IS NULL`,
      [id],
    );

    return {
      ...project,
      pow_items: powItems.rows,
      phases: phases.rows,
      team_members: teamMembers.rows,
    };
  }

  async create(dto: CreateRepairProjectDto, userId: string, user?: JwtPayload): Promise<any> {
    // Check for duplicate project_code
    const existing = await this.db.query(
      `SELECT id FROM repair_projects WHERE project_code = $1 AND deleted_at IS NULL`,
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
        // Map RepairStatus to ProjectStatus for base projects table
        const projectStatus = this.mapRepairStatusToProjectStatus(dto.status);

        await this.db.query(
          `INSERT INTO projects (id, project_code, title, description, project_type, start_date, end_date, status, budget, campus, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            projectId,
            dto.project_code,
            dto.title,
            dto.description || null,
            'REPAIR',
            dto.start_date || null,
            dto.end_date || null,
            projectStatus,
            dto.budget || null,
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

      // Create repair_projects record with publication_status
      // Phase AN: Include assigned_to for inline assignment during creation
      const result = await this.db.query(
        `INSERT INTO repair_projects
         (project_id, project_code, title, description, building_name, floor_number, room_number,
          specific_location, repair_type_id, urgency_level, is_emergency, campus, reported_by,
          inspection_date, inspector_id, inspection_findings, status, start_date, end_date,
          budget, actual_cost, project_manager_id, contractor_id, facility_id, assigned_technician, metadata, created_by,
          publication_status, submitted_by, submitted_at, assigned_to)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31)
         RETURNING *`,
        [
          projectId, dto.project_code, dto.title, dto.description, dto.building_name,
          dto.floor_number, dto.room_number, dto.specific_location, dto.repair_type_id,
          dto.urgency_level, dto.is_emergency || false, dto.campus, dto.reported_by,
          dto.inspection_date, dto.inspector_id, dto.inspection_findings, dto.status,
          dto.start_date, dto.end_date, dto.budget, dto.actual_cost || null, dto.project_manager_id, dto.contractor_id,
          dto.facility_id, dto.assigned_technician, dto.metadata ? JSON.stringify(dto.metadata) : null, userId,
          publicationStatus, submittedBy, submittedAt, dto.assigned_to || null,
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
      this.logger.log(`REPAIR_PROJECT_CREATED: id=${recordId}, status=${publicationStatus}, by=${userId}`);
      return result.rows[0];
    } catch (error) {
      await this.db.query('ROLLBACK');
      throw error;
    }
  }

  async update(id: string, dto: UpdateRepairProjectDto, userId: string, user?: JwtPayload): Promise<any> {
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
        `SELECT id FROM repair_projects WHERE project_code = $1 AND id != $2 AND deleted_at IS NULL`,
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
    if (fields.length === 0) return this.findOne(id);

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
      `UPDATE repair_projects SET ${setClause}, updated_by = $${values.length + 1}, updated_at = NOW()
       WHERE id = $${values.length + 2} AND deleted_at IS NULL RETURNING *`,
      [...values, userId, id],
    );

    // Phase AT: Handle multi-select assignments via junction table
    if (dto.assigned_user_ids !== undefined) {
      await this.updateRecordAssignments(id, dto.assigned_user_ids || []);
    }

    this.logger.log(`REPAIR_PROJECT_UPDATED: id=${id}, by=${userId}, fields=[${fields.join(',')}]${requiresStatusReset ? `, status_reset=DRAFT (was=${priorStatus})` : ''}`);
    return this.findOne(id);  // Return fresh data with assigned_users
  }

  async remove(id: string, userId: string): Promise<void> {
    const project = await this.findOne(id);

    // Begin atomic transaction to delete both domain and base records
    await this.db.query('BEGIN');
    try {
      // Soft delete repair_projects record
      await this.db.query(
        `UPDATE repair_projects SET deleted_at = NOW(), deleted_by = $1 WHERE id = $2`,
        [userId, id],
      );

      // Soft delete base projects record
      await this.db.query(
        `UPDATE projects SET deleted_at = NOW(), deleted_by = $1 WHERE id = $2`,
        [userId, project.project_id],
      );

      await this.db.query('COMMIT');
      this.logger.log(`REPAIR_PROJECT_DELETED: id=${id}, by=${userId}`);
    } catch (error) {
      await this.db.query('ROLLBACK');
      throw error;
    }
  }

  // --- Draft Governance Workflow ---

  async submitForReview(id: string, userId: string): Promise<any> {
    const project = await this.findOne(id);

    if (project.publication_status !== 'DRAFT' && project.publication_status !== 'REJECTED') {
      throw new BadRequestException(
        `Only DRAFT or REJECTED records can be submitted for review. Current status: ${project.publication_status}`,
      );
    }

    // Phase AD: Creator OR assigned user can submit for review
    const isOwner = project.created_by === userId;
    const isAssigned = project.assigned_to === userId;
    if (!isOwner && !isAssigned) {
      throw new ForbiddenException('Only the creator or assigned user can submit this draft for review');
    }

    const result = await this.db.query(
      `UPDATE repair_projects
       SET publication_status = 'PENDING_REVIEW',
           submitted_by = $1,
           submitted_at = NOW(),
           review_notes = NULL,
           updated_at = NOW()
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [userId, id],
    );

    this.logger.log(`REPAIR_PROJECT_SUBMITTED_FOR_REVIEW: id=${id}, by=${userId}`);
    return result.rows[0];
  }

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
      `UPDATE repair_projects
       SET publication_status = 'PUBLISHED',
           reviewed_by = $1,
           reviewed_at = NOW(),
           review_notes = NULL,
           updated_at = NOW()
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [adminId, id],
    );

    this.logger.log(`REPAIR_PROJECT_PUBLISHED: id=${id}, by=${adminId}`);
    return result.rows[0];
  }

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
      `UPDATE repair_projects
       SET publication_status = 'REJECTED',
           reviewed_by = $1,
           reviewed_at = NOW(),
           review_notes = $2,
           updated_at = NOW()
       WHERE id = $3 AND deleted_at IS NULL
       RETURNING *`,
      [adminId, notes.trim(), id],
    );

    this.logger.log(`REPAIR_PROJECT_REJECTED: id=${id}, by=${adminId}`);
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
      `UPDATE repair_projects
       SET publication_status = 'DRAFT',
           submitted_by = NULL,
           submitted_at = NULL,
           updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id],
    );

    this.logger.log(`REPAIR_PROJECT_WITHDRAWN: id=${id}, by=${userId}`);
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

    // Check module access (SuperAdmin or user with REPAIR/ALL assignment)
    if (!user.is_superadmin) {
      const accessCheck = await this.db.query(
        `SELECT 1 FROM user_module_assignments
         WHERE user_id = $1
           AND (module = 'REPAIR' OR module = 'ALL')`,
        [user.sub],
      );

      if (accessCheck.rows.length === 0) {
        return []; // No access to this module
      }
    }

    const result = await this.db.query(
      `SELECT rp.id, rp.project_code, rp.title, rp.campus, rp.publication_status,
              rp.submitted_by, rp.submitted_at, rp.created_at,
              u.first_name || ' ' || u.last_name as submitter_name
       FROM repair_projects rp
       LEFT JOIN users u ON rp.submitted_by = u.id
       WHERE rp.publication_status = 'PENDING_REVIEW'
         AND rp.deleted_at IS NULL
       ORDER BY rp.submitted_at ASC`,
    );

    return result.rows;
  }

  async findMyDrafts(userId: string): Promise<any[]> {
    const result = await this.db.query(
      `SELECT id, project_code, title, campus, publication_status,
              submitted_at, review_notes, created_at
       FROM repair_projects
       WHERE created_by = $1
         AND publication_status IN ('DRAFT', 'PENDING_REVIEW', 'REJECTED')
         AND deleted_at IS NULL
       ORDER BY created_at DESC`,
      [userId],
    );

    return result.rows;
  }

  // --- POW Items ---
  async findPowItems(projectId: string, category?: string, phase?: string): Promise<any[]> {
    await this.findOne(projectId);
    let query = `SELECT * FROM repair_pow_items WHERE repair_project_id = $1 AND deleted_at IS NULL`;
    const params: any[] = [projectId];
    let paramIndex = 2;

    if (category) { query += ` AND category = $${paramIndex++}`; params.push(category); }
    if (phase) { query += ` AND phase = $${paramIndex++}`; params.push(phase); }

    query += ` ORDER BY item_number`;
    const result = await this.db.query(query, params);
    return result.rows;
  }

  async createPowItem(projectId: string, dto: CreatePowItemDto, userId: string): Promise<any> {
    await this.findOne(projectId);
    const result = await this.db.query(
      `INSERT INTO repair_pow_items
       (repair_project_id, item_number, description, unit, quantity, estimated_material_cost,
        estimated_labor_cost, estimated_project_cost, unit_cost, date_entry, category, phase, remarks, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [projectId, dto.item_number, dto.description, dto.unit, dto.quantity, dto.estimated_material_cost,
       dto.estimated_labor_cost, dto.estimated_project_cost, dto.unit_cost, dto.date_entry,
       dto.category, dto.phase, dto.remarks, dto.metadata ? JSON.stringify(dto.metadata) : null],
    );
    this.logger.log(`POW_ITEM_CREATED: id=${result.rows[0].id}, project=${projectId}, by=${userId}`);
    return result.rows[0];
  }

  async updatePowItem(projectId: string, itemId: string, dto: Partial<CreatePowItemDto>, userId: string): Promise<any> {
    await this.findOne(projectId);
    const check = await this.db.query(
      `SELECT id FROM repair_pow_items WHERE id = $1 AND repair_project_id = $2 AND deleted_at IS NULL`, [itemId, projectId]);
    if (check.rows.length === 0) throw new NotFoundException(`POW item ${itemId} not found`);

    const fields = Object.keys(dto).filter((k) => dto[k] !== undefined);
    if (fields.length === 0) {
      const current = await this.db.query(`SELECT * FROM repair_pow_items WHERE id = $1`, [itemId]);
      return current.rows[0];
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map((f) => (f === 'metadata' ? JSON.stringify(dto[f]) : dto[f]));
    const result = await this.db.query(
      `UPDATE repair_pow_items SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, itemId],
    );
    this.logger.log(`POW_ITEM_UPDATED: id=${itemId}, by=${userId}`);
    return result.rows[0];
  }

  async removePowItem(projectId: string, itemId: string, userId: string): Promise<void> {
    await this.findOne(projectId);
    const result = await this.db.query(
      `UPDATE repair_pow_items SET deleted_at = NOW(), deleted_by = $1 WHERE id = $2 AND repair_project_id = $3 AND deleted_at IS NULL`,
      [userId, itemId, projectId],
    );
    if (result.rowCount === 0) throw new NotFoundException(`POW item ${itemId} not found`);
    this.logger.log(`POW_ITEM_DELETED: id=${itemId}, by=${userId}`);
  }

  // --- Phases ---
  async findPhases(projectId: string): Promise<any[]> {
    await this.findOne(projectId);
    const result = await this.db.query(
      `SELECT * FROM repair_project_phases WHERE repair_project_id = $1 AND deleted_at IS NULL ORDER BY created_at`, [projectId]);
    return result.rows;
  }

  async createPhase(projectId: string, dto: CreatePhaseDto): Promise<any> {
    await this.findOne(projectId);
    const result = await this.db.query(
      `INSERT INTO repair_project_phases
       (repair_project_id, phase_name, phase_description, target_progress, actual_progress, status,
        target_start_date, target_end_date, remarks) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [projectId, dto.phase_name, dto.phase_description, dto.target_progress, dto.actual_progress,
       dto.status, dto.target_start_date, dto.target_end_date, dto.remarks],
    );
    this.logger.log(`PHASE_CREATED: id=${result.rows[0].id}, project=${projectId}`);
    return result.rows[0];
  }

  async updatePhase(projectId: string, phaseId: string, dto: Partial<CreatePhaseDto>): Promise<any> {
    await this.findOne(projectId);
    const check = await this.db.query(
      `SELECT id FROM repair_project_phases WHERE id = $1 AND repair_project_id = $2 AND deleted_at IS NULL`, [phaseId, projectId]);
    if (check.rows.length === 0) throw new NotFoundException(`Phase ${phaseId} not found`);

    const fields = Object.keys(dto).filter((k) => dto[k] !== undefined);
    if (fields.length === 0) {
      const current = await this.db.query(`SELECT * FROM repair_project_phases WHERE id = $1`, [phaseId]);
      return current.rows[0];
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map((f) => dto[f]);
    const result = await this.db.query(
      `UPDATE repair_project_phases SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, phaseId],
    );
    this.logger.log(`PHASE_UPDATED: id=${phaseId}`);
    return result.rows[0];
  }

  // --- Team Members ---
  async findTeamMembers(projectId: string): Promise<any[]> {
    await this.findOne(projectId);
    const result = await this.db.query(
      `SELECT * FROM repair_project_team_members WHERE repair_project_id = $1 AND deleted_at IS NULL`, [projectId]);
    return result.rows;
  }

  async createTeamMember(projectId: string, dto: CreateTeamMemberDto): Promise<any> {
    await this.findOne(projectId);
    const result = await this.db.query(
      `INSERT INTO repair_project_team_members
       (repair_project_id, user_id, name, role, department, responsibilities, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [projectId, dto.user_id, dto.name, dto.role, dto.department, dto.responsibilities, dto.status || 'Active'],
    );
    this.logger.log(`TEAM_MEMBER_CREATED: id=${result.rows[0].id}, project=${projectId}`);
    return result.rows[0];
  }

  async removeTeamMember(projectId: string, memberId: string): Promise<void> {
    await this.findOne(projectId);
    const result = await this.db.query(
      `UPDATE repair_project_team_members SET deleted_at = NOW() WHERE id = $1 AND repair_project_id = $2 AND deleted_at IS NULL`,
      [memberId, projectId],
    );
    if (result.rowCount === 0) throw new NotFoundException(`Team member ${memberId} not found`);
    this.logger.log(`TEAM_MEMBER_DELETED: id=${memberId}`);
  }
}
