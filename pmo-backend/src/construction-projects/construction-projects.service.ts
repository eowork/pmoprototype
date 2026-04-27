import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import type { FilterQuery } from '@mikro-orm/core';
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
import {
  ConstructionProject,
  ConstructionMilestone,
  ConstructionProjectFinancial,
  ConstructionGallery,
  RecordAssignment,
  Project,
} from '../database/entities';

// Publication status values matching database enum
export type PublicationStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED';

@Injectable()
export class ConstructionProjectsService {
  private readonly logger = new Logger(ConstructionProjectsService.name);
  private readonly ALLOWED_SORTS = [
    'created_at',
    'title',
    'status',
    'start_date',
    'target_completion_date',
    'physical_progress',
  ];

  constructor(
    @InjectRepository(ConstructionProject)
    private readonly cpRepo: EntityRepository<ConstructionProject>,
    @InjectRepository(ConstructionMilestone)
    private readonly milestoneRepo: EntityRepository<ConstructionMilestone>,
    @InjectRepository(ConstructionProjectFinancial)
    private readonly financialRepo: EntityRepository<ConstructionProjectFinancial>,
    @InjectRepository(ConstructionGallery)
    private readonly galleryRepo: EntityRepository<ConstructionGallery>,
    @InjectRepository(RecordAssignment)
    private readonly assignmentRepo: EntityRepository<RecordAssignment>,
    @InjectRepository(Project)
    private readonly projectRepo: EntityRepository<Project>,
    private readonly em: EntityManager,
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

  private normalizeUserCampusToRecordCampus(
    userCampus: string | null | undefined,
  ): string | null {
    if (!userCampus) return null;
    if (userCampus === 'Butuan Campus') return 'MAIN';
    if (userCampus === 'Cabadbaran') return 'CABADBARAN';
    return null;
  }

  private async updateRecordAssignments(
    recordId: string,
    userIds: string[],
  ): Promise<void> {
    await this.em.nativeDelete(RecordAssignment, {
      module: 'CONSTRUCTION',
      recordId,
    });
    for (const userId of userIds) {
      const assignment = this.assignmentRepo.create({
        module: 'CONSTRUCTION',
        recordId,
        userId,
      });
      this.em.persist(assignment);
    }
    await this.em.flush();
  }

  private async getRecordAssignments(recordId: string): Promise<string[]> {
    const assignments = await this.assignmentRepo.find({
      module: 'CONSTRUCTION',
      recordId,
    });
    return assignments.map((a) => a.userId);
  }

  private async isUserAssigned(
    recordId: string,
    userId: string,
  ): Promise<boolean> {
    const count = await this.assignmentRepo.count({
      module: 'CONSTRUCTION',
      recordId,
      userId,
    });
    return count > 0;
  }

  // --- RAW SQL reads (complex JOINs preserved) ---

  async findAll(
    query: QueryConstructionProjectDto,
    user?: JwtPayload,
  ): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20, sort = 'created_at', order = 'desc' } = query;
    const offset = (page - 1) * limit;

    const sortColumn = this.ALLOWED_SORTS.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const conditions: string[] = ['cp.deleted_at IS NULL'];
    const params: any[] = [];

    const queryAny = query as any;
    if (queryAny.publication_status) {
      if (
        queryAny.publication_status !== 'PUBLISHED' &&
        user &&
        !this.isAdmin(user)
      ) {
        conditions.push(`(cp.publication_status = ? AND cp.created_by = ?)`);
        params.push(queryAny.publication_status, user.sub);
      } else {
        conditions.push(`cp.publication_status = ?`);
        params.push(queryAny.publication_status);
      }
    } else if (user && !this.isAdmin(user)) {
      const recordCampus = this.normalizeUserCampusToRecordCampus(user.campus);
      if (recordCampus) {
        conditions.push(
          `(cp.campus = ? OR cp.created_by = ? OR EXISTS (SELECT 1 FROM record_assignments ra WHERE ra.module = 'CONSTRUCTION' AND ra.record_id = cp.id AND ra.user_id = ?))`,
        );
        params.push(recordCampus, user.sub, user.sub);
      } else {
        conditions.push(
          `(cp.publication_status = 'PUBLISHED' OR cp.created_by = ? OR EXISTS (SELECT 1 FROM record_assignments ra WHERE ra.module = 'CONSTRUCTION' AND ra.record_id = cp.id AND ra.user_id = ?))`,
        );
        params.push(user.sub, user.sub);
      }
    }

    if (query.status) {
      conditions.push(`cp.status = ?`);
      params.push(query.status);
    }
    if (query.campus) {
      conditions.push(`cp.campus = ?`);
      params.push(query.campus);
    }
    if (query.contractor_id) {
      conditions.push(`cp.contractor_id = ?`);
      params.push(query.contractor_id);
    }
    if (query.funding_source_id) {
      conditions.push(`cp.funding_source_id = ?`);
      params.push(query.funding_source_id);
    }

    const whereClause = conditions.join(' AND ');
    const conn = this.em.getConnection();

    const countResult = await conn.execute(
      `SELECT COUNT(*) FROM construction_projects cp WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult[0].count, 10);

    const dataResult = await conn.execute(
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
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    return createPaginatedResponse(dataResult, total, page, limit);
  }

  async findOne(id: string): Promise<any> {
    const conn = this.em.getConnection();
    const result = await conn.execute(
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
       WHERE cp.id = ? AND cp.deleted_at IS NULL`,
      [id],
    );

    if (result.length === 0) {
      throw new NotFoundException(
        `Construction project with ID ${id} not found`,
      );
    }

    const project = result[0];

    const milestones = await this.milestoneRepo.find(
      { projectId: id },
      { orderBy: { targetDate: 'asc' } },
    );

    const financials = await this.financialRepo.find(
      { projectId: id },
      { orderBy: { fiscalYear: 'desc' } },
    );

    return { ...project, milestones, financials };
  }

  async create(
    dto: CreateConstructionProjectDto,
    userId: string,
    _user?: JwtPayload,
  ): Promise<any> {
    const existing = await this.cpRepo.findOne(
      { projectCode: dto.project_code },
      { filters: false },
    );
    if (existing) {
      throw new ConflictException(
        `Project code ${dto.project_code} already exists`,
      );
    }

    const projectId = dto.project_id || uuidv4();
    const publicationStatus: PublicationStatus = 'DRAFT';
    const submittedBy = userId;
    const submittedAt = new Date();

    return await this.em.transactional(async (em) => {
      const conn = em.getConnection();

      if (!dto.project_id) {
        await conn.execute(
          `INSERT INTO projects (id, project_code, title, description, project_type, start_date, end_date, status, budget, campus, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        const projectCheck = await this.projectRepo.findOne({
          id: dto.project_id,
        });
        if (!projectCheck) {
          throw new BadRequestException(
            `Project with ID ${dto.project_id} not found`,
          );
        }
      }

      const cpResult = await conn.execute(
        `INSERT INTO construction_projects
         (project_id, project_code, title, description, ideal_infrastructure_image, beneficiaries,
          objectives, key_features, original_contract_duration, contract_number, contractor_id,
          contract_amount, start_date, target_completion_date, project_duration, project_engineer,
          project_manager, building_type, floor_area, number_of_floors, funding_source_id,
          subcategory_id, campus, status, latitude, longitude, metadata, created_by,
          publication_status, submitted_by, submitted_at, assigned_to)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

      const recordId = cpResult[0].id;

      if (dto.assigned_user_ids && dto.assigned_user_ids.length > 0) {
        for (const uid of dto.assigned_user_ids) {
          await conn.execute(
            `INSERT INTO record_assignments (module, record_id, user_id) VALUES ('CONSTRUCTION', ?, ?)
             ON CONFLICT (module, record_id, user_id) DO NOTHING`,
            [recordId, uid],
          );
        }
      } else if (dto.assigned_to) {
        await conn.execute(
          `INSERT INTO record_assignments (module, record_id, user_id) VALUES ('CONSTRUCTION', ?, ?)
           ON CONFLICT (module, record_id, user_id) DO NOTHING`,
          [recordId, dto.assigned_to],
        );
      }

      this.logger.log(
        `CONSTRUCTION_PROJECT_CREATED: id=${recordId}, status=${publicationStatus}, by=${userId}`,
      );
      return cpResult[0];
    });
  }

  async update(
    id: string,
    dto: UpdateConstructionProjectDto,
    userId: string,
    user?: JwtPayload,
  ): Promise<any> {
    const currentRecord = await this.findOne(id);

    if (user && !this.permissionResolver.isAdmin(user)) {
      const isOwner = currentRecord.created_by === userId;
      const isAssigned = await this.isUserAssigned(id, userId);
      if (!isOwner && !isAssigned) {
        throw new ForbiddenException(
          'Cannot edit records you do not own or are not assigned to',
        );
      }
    }

    const conn = this.em.getConnection();
    const dtoAny = dto as any;

    if (dtoAny.project_code) {
      const existing = await conn.execute(
        `SELECT id FROM construction_projects WHERE project_code = ? AND id != ? AND deleted_at IS NULL`,
        [dtoAny.project_code, id],
      );
      if (existing.length > 0) {
        throw new ConflictException(
          `Project code ${dtoAny.project_code} already exists`,
        );
      }
    }

    if (dtoAny.publication_status) {
      throw new BadRequestException(
        'Cannot change publication_status via update. ' +
          'Use POST /:id/submit-for-review (DRAFT → PENDING_REVIEW), ' +
          'POST /:id/publish (PENDING_REVIEW → PUBLISHED), or ' +
          'POST /:id/reject (PENDING_REVIEW → REJECTED).',
      );
    }

    const priorStatus = currentRecord.publication_status;
    const requiresStatusReset = [
      'PUBLISHED',
      'REJECTED',
      'PENDING_REVIEW',
    ].includes(priorStatus);
    if (requiresStatusReset) {
      this.logger.log(
        `STATUS_REVERTED: id=${id}, by=${userId}, was=${priorStatus}, now=DRAFT`,
      );
    }

    const fields = Object.keys(dto).filter(
      (k) => dto[k] !== undefined && k !== 'assigned_user_ids',
    );
    if (fields.length === 0 && !requiresStatusReset) {
      return this.findOne(id);
    }

    const jsonFields = ['objectives', 'key_features', 'metadata'];
    let setClause = fields.map((f) => `${f} = ?`).join(', ');
    const values = fields.map((f) =>
      jsonFields.includes(f) ? JSON.stringify(dto[f]) : dto[f],
    );

    if (requiresStatusReset) {
      let resetFields: string[];
      if (priorStatus === 'PENDING_REVIEW') {
        resetFields = [
          `publication_status = 'DRAFT'`,
          `submitted_by = NULL`,
          `submitted_at = NULL`,
        ];
      } else {
        resetFields = [
          `publication_status = 'DRAFT'`,
          `reviewed_by = NULL`,
          `reviewed_at = NULL`,
          `review_notes = NULL`,
          `submitted_by = ?`,
          `submitted_at = NOW()`,
        ];
        values.push(userId);
      }
      setClause = setClause
        ? `${setClause}, ${resetFields.join(', ')}`
        : resetFields.join(', ');
    }

    await conn.execute(
      `UPDATE construction_projects
       SET ${setClause}, updated_by = ?, updated_at = NOW()
       WHERE id = ? AND deleted_at IS NULL
       RETURNING *`,
      [...values, userId, id],
    );

    if (dto.assigned_user_ids !== undefined) {
      await this.updateRecordAssignments(id, dto.assigned_user_ids || []);
    }

    this.logger.log(
      `CONSTRUCTION_PROJECT_UPDATED: id=${id}, by=${userId}, fields=[${fields.join(',')}]${requiresStatusReset ? `, status_reset=DRAFT (was=${priorStatus})` : ''}`,
    );
    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const project = await this.findOne(id);

    await this.em.transactional(async (em) => {
      const conn = em.getConnection();
      await conn.execute(
        `UPDATE construction_projects SET deleted_at = NOW(), deleted_by = ? WHERE id = ?`,
        [userId, id],
      );
      await conn.execute(
        `UPDATE projects SET deleted_at = NOW(), deleted_by = ? WHERE id = ?`,
        [userId, project.project_id],
      );
    });

    this.logger.log(`CONSTRUCTION_PROJECT_DELETED: id=${id}, by=${userId}`);
  }

  // --- Draft Governance Workflow (ORM) ---

  async submitForReview(id: string, userId: string): Promise<any> {
    const project = await this.findOne(id);

    if (
      project.publication_status !== 'DRAFT' &&
      project.publication_status !== 'REJECTED'
    ) {
      throw new BadRequestException(
        `Only DRAFT or REJECTED records can be submitted for review. Current status: ${project.publication_status}`,
      );
    }

    const isOwner = project.created_by === userId;
    const isAssigned = await this.isUserAssigned(id, userId);
    if (!isOwner && !isAssigned) {
      throw new ForbiddenException(
        'Only the creator or assigned user can submit this draft for review',
      );
    }

    const entity = await this.cpRepo.findOne({ id });
    if (!entity)
      throw new NotFoundException(
        `Construction project with ID ${id} not found`,
      );

    entity.publicationStatus = 'PENDING_REVIEW';
    entity.submittedBy = userId;
    entity.submittedAt = new Date();
    entity.reviewNotes = undefined;
    await this.em.flush();

    this.logger.log(
      `CONSTRUCTION_PROJECT_SUBMITTED_FOR_REVIEW: id=${id}, by=${userId}`,
    );
    return this.findOne(id);
  }

  async publish(id: string, adminId: string, user: JwtPayload): Promise<any> {
    if (!this.permissionResolver.isAdmin(user)) {
      throw new ForbiddenException('Only Admin can publish records');
    }

    const project = await this.findOne(id);

    const approvalCheck = await this.permissionResolver.canApproveByRank(
      adminId,
      project.created_by,
      user.is_superadmin,
    );
    if (!approvalCheck.allowed) {
      throw new ForbiddenException(approvalCheck.reason);
    }

    if (project.publication_status !== 'PENDING_REVIEW') {
      throw new BadRequestException(
        `Only PENDING_REVIEW records can be published. Current status: ${project.publication_status}. ` +
          `DRAFT records must first be submitted for review via POST /:id/submit-for-review.`,
      );
    }

    const entity = await this.cpRepo.findOne({ id });
    if (!entity)
      throw new NotFoundException(
        `Construction project with ID ${id} not found`,
      );

    entity.publicationStatus = 'PUBLISHED';
    entity.reviewedBy = adminId;
    entity.reviewedAt = new Date();
    entity.reviewNotes = undefined;
    await this.em.flush();

    this.logger.log(`CONSTRUCTION_PROJECT_PUBLISHED: id=${id}, by=${adminId}`);
    return this.findOne(id);
  }

  async reject(
    id: string,
    adminId: string,
    notes: string,
    user: JwtPayload,
  ): Promise<any> {
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

    const entity = await this.cpRepo.findOne({ id });
    if (!entity)
      throw new NotFoundException(
        `Construction project with ID ${id} not found`,
      );

    entity.publicationStatus = 'REJECTED';
    entity.reviewedBy = adminId;
    entity.reviewedAt = new Date();
    entity.reviewNotes = notes.trim();
    await this.em.flush();

    this.logger.log(`CONSTRUCTION_PROJECT_REJECTED: id=${id}, by=${adminId}`);
    return this.findOne(id);
  }

  async withdraw(id: string, userId: string): Promise<any> {
    const project = await this.findOne(id);

    if (project.publication_status !== 'PENDING_REVIEW') {
      throw new BadRequestException(
        `Only PENDING_REVIEW records can be withdrawn. Current status: ${project.publication_status}`,
      );
    }

    if (project.submitted_by !== userId) {
      throw new ForbiddenException(
        'Only the original submitter can withdraw this submission',
      );
    }

    const entity = await this.cpRepo.findOne({ id });
    if (!entity)
      throw new NotFoundException(
        `Construction project with ID ${id} not found`,
      );

    entity.publicationStatus = 'DRAFT';
    entity.submittedBy = undefined;
    entity.submittedAt = undefined;
    await this.em.flush();

    this.logger.log(`CONSTRUCTION_PROJECT_WITHDRAWN: id=${id}, by=${userId}`);
    return this.findOne(id);
  }

  async findPendingReview(user: JwtPayload): Promise<any[]> {
    if (!this.isAdmin(user)) {
      throw new ForbiddenException('Only Admin can view pending reviews');
    }

    const conn = this.em.getConnection();

    if (!user.is_superadmin) {
      const accessCheck = await conn.execute(
        `SELECT 1 FROM user_module_assignments
         WHERE user_id = ? AND (module = 'CONSTRUCTION' OR module = 'ALL')`,
        [user.sub],
      );
      if (accessCheck.length === 0) return [];
    }

    const result = await conn.execute(
      `SELECT cp.id, cp.project_code, cp.title, cp.campus, cp.publication_status,
              cp.submitted_by, cp.submitted_at, cp.created_at,
              u.first_name || ' ' || u.last_name as submitter_name
       FROM construction_projects cp
       LEFT JOIN users u ON cp.submitted_by = u.id
       WHERE cp.publication_status = 'PENDING_REVIEW'
         AND cp.deleted_at IS NULL
       ORDER BY cp.submitted_at ASC`,
    );

    return result;
  }

  async findMyDrafts(userId: string): Promise<ConstructionProject[]> {
    return this.cpRepo.find(
      {
        createdBy: userId,
        publicationStatus: { $in: ['DRAFT', 'PENDING_REVIEW', 'REJECTED'] },
      },
      { orderBy: { createdAt: 'desc' } },
    );
  }

  // --- Milestones (ORM) ---
  async findMilestones(projectId: string): Promise<ConstructionMilestone[]> {
    await this.findOne(projectId);
    return this.milestoneRepo.find(
      { projectId },
      { orderBy: { targetDate: 'asc' } },
    );
  }

  async createMilestone(
    projectId: string,
    dto: CreateMilestoneDto,
  ): Promise<ConstructionMilestone> {
    await this.findOne(projectId);
    const entity = this.milestoneRepo.create({
      projectId,
      title: dto.title,
      description: dto.description,
      targetDate: dto.target_date ? new Date(dto.target_date) : undefined,
      status: dto.status || 'PENDING',
      remarks: dto.remarks,
    });
    await this.em.persist(entity).flush();
    this.logger.log(`MILESTONE_CREATED: id=${entity.id}, project=${projectId}`);
    return entity;
  }

  async updateMilestone(
    projectId: string,
    milestoneId: string,
    dto: Partial<CreateMilestoneDto>,
  ): Promise<ConstructionMilestone> {
    await this.findOne(projectId);
    const entity = await this.milestoneRepo.findOne({
      id: milestoneId,
      projectId,
    });
    if (!entity)
      throw new NotFoundException(`Milestone ${milestoneId} not found`);

    if (dto.title !== undefined) entity.title = dto.title;
    if (dto.description !== undefined) entity.description = dto.description;
    if (dto.target_date !== undefined)
      entity.targetDate = dto.target_date
        ? new Date(dto.target_date)
        : undefined;
    if (dto.status !== undefined) entity.status = dto.status;
    if (dto.remarks !== undefined) entity.remarks = dto.remarks;
    await this.em.flush();

    this.logger.log(`MILESTONE_UPDATED: id=${milestoneId}`);
    return entity;
  }

  async removeMilestone(projectId: string, milestoneId: string): Promise<void> {
    await this.findOne(projectId);
    const count = await this.milestoneRepo.nativeDelete({
      id: milestoneId,
      projectId,
    });
    if (count === 0)
      throw new NotFoundException(`Milestone ${milestoneId} not found`);
    this.logger.log(`MILESTONE_DELETED: id=${milestoneId}`);
  }

  // --- Financials (ORM) ---
  async findFinancials(
    projectId: string,
    fiscalYear?: number,
  ): Promise<ConstructionProjectFinancial[]> {
    await this.findOne(projectId);
    const where: FilterQuery<ConstructionProjectFinancial> = { projectId };
    if (fiscalYear) where.fiscalYear = fiscalYear;
    return this.financialRepo.find(where, { orderBy: { fiscalYear: 'desc' } });
  }

  async createFinancial(
    projectId: string,
    dto: CreateConstructionFinancialDto,
    userId: string,
  ): Promise<ConstructionProjectFinancial> {
    await this.findOne(projectId);
    const entity = this.financialRepo.create({
      projectId,
      fiscalYear: dto.fiscal_year,
      appropriation: String(dto.appropriation),
      obligation: String(dto.obligation),
      disbursement: dto.disbursement != null ? String(dto.disbursement) : '0',
      metadata: dto.metadata,
    });
    await this.em.persist(entity).flush();
    this.logger.log(
      `CONSTRUCTION_FINANCIAL_CREATED: id=${entity.id}, project=${projectId}, by=${userId}`,
    );
    return entity;
  }

  async updateFinancial(
    projectId: string,
    financialId: string,
    dto: Partial<CreateConstructionFinancialDto>,
    userId: string,
  ): Promise<ConstructionProjectFinancial> {
    await this.findOne(projectId);
    const entity = await this.financialRepo.findOne({
      id: financialId,
      projectId,
    });
    if (!entity)
      throw new NotFoundException(`Financial record ${financialId} not found`);

    if (dto.fiscal_year !== undefined) entity.fiscalYear = dto.fiscal_year;
    if (dto.appropriation !== undefined)
      entity.appropriation = String(dto.appropriation);
    if (dto.obligation !== undefined)
      entity.obligation = String(dto.obligation);
    if (dto.disbursement !== undefined)
      entity.disbursement = String(dto.disbursement);
    if (dto.metadata !== undefined) entity.metadata = dto.metadata;
    await this.em.flush();

    this.logger.log(
      `CONSTRUCTION_FINANCIAL_UPDATED: id=${financialId}, by=${userId}`,
    );
    return entity;
  }

  async removeFinancial(
    projectId: string,
    financialId: string,
    userId: string,
  ): Promise<void> {
    await this.findOne(projectId);
    const entity = await this.financialRepo.findOne({
      id: financialId,
      projectId,
    });
    if (!entity)
      throw new NotFoundException(`Financial record ${financialId} not found`);

    entity.deletedAt = new Date();
    entity.deletedBy = userId;
    await this.em.flush();

    this.logger.log(
      `CONSTRUCTION_FINANCIAL_DELETED: id=${financialId}, by=${userId}`,
    );
  }

  // --- Gallery (ORM) ---
  async findGallery(
    projectId: string,
    query: QueryGalleryDto,
  ): Promise<PaginatedResponse<ConstructionGallery>> {
    await this.findOne(projectId);

    const { page = 1, limit = 20, sort = 'uploadedAt', order = 'desc' } = query;
    const sortKey = ['uploadedAt', 'category'].includes(sort)
      ? sort
      : 'uploadedAt';
    const sortOrder = (order.toLowerCase() === 'asc' ? 'asc' : 'desc') as
      | 'asc'
      | 'desc';

    const where: FilterQuery<ConstructionGallery> = { projectId };
    if (query.category) where.category = query.category;

    const [items, total] = await this.galleryRepo.findAndCount(where, {
      limit,
      offset: (page - 1) * limit,
      orderBy: { [sortKey]: sortOrder },
    });

    return createPaginatedResponse(items, total, page, limit);
  }

  async findGalleryItem(
    projectId: string,
    galleryId: string,
  ): Promise<ConstructionGallery> {
    await this.findOne(projectId);
    const entity = await this.galleryRepo.findOne({ id: galleryId, projectId });
    if (!entity)
      throw new NotFoundException(`Gallery item ${galleryId} not found`);
    return entity;
  }

  async createGalleryItem(
    projectId: string,
    file: Express.Multer.File,
    dto: CreateGalleryDto,
    userId: string,
  ): Promise<ConstructionGallery> {
    await this.findOne(projectId);

    if (!file) throw new BadRequestException('Image file is required');

    const uploadResult = await this.uploadsService.uploadFile(
      file,
      userId,
      'construction_gallery',
      projectId,
    );

    const entity = this.galleryRepo.create({
      projectId,
      imageUrl: uploadResult.filePath,
      caption: dto.caption,
      category: dto.category || 'PROGRESS',
      isFeatured: dto.is_featured || false,
    });
    await this.em.persist(entity).flush();

    this.logger.log(
      `GALLERY_CREATED: id=${entity.id}, project=${projectId}, by=${userId}`,
    );
    return entity;
  }

  async updateGalleryItem(
    projectId: string,
    galleryId: string,
    dto: Partial<CreateGalleryDto>,
    userId: string,
  ): Promise<ConstructionGallery> {
    const entity = await this.findGalleryItem(projectId, galleryId);

    if (dto.caption !== undefined) entity.caption = dto.caption;
    if (dto.category !== undefined) entity.category = dto.category;
    if (dto.is_featured !== undefined) entity.isFeatured = dto.is_featured;
    await this.em.flush();

    this.logger.log(`GALLERY_UPDATED: id=${galleryId}, by=${userId}`);
    return entity;
  }

  async removeGalleryItem(
    projectId: string,
    galleryId: string,
    userId: string,
  ): Promise<void> {
    const entity = await this.findGalleryItem(projectId, galleryId);

    if (entity.imageUrl) {
      await this.uploadsService.deleteFile(entity.imageUrl);
    }

    await this.galleryRepo.nativeDelete({ id: galleryId });
    this.logger.log(`GALLERY_DELETED: id=${galleryId}, by=${userId}`);
  }
}
