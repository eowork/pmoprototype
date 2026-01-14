import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { createPaginatedResponse, PaginatedResponse } from '../common/dto';
import {
  CreateRepairProjectDto,
  UpdateRepairProjectDto,
  QueryRepairProjectDto,
  CreatePowItemDto,
  CreatePhaseDto,
  CreateTeamMemberDto,
} from './dto';

@Injectable()
export class RepairProjectsService {
  private readonly logger = new Logger(RepairProjectsService.name);
  private readonly ALLOWED_SORTS = ['created_at', 'title', 'status', 'urgency_level', 'start_date', 'reported_date'];

  constructor(private readonly db: DatabaseService) {}

  async findAll(query: QueryRepairProjectDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20, sort = 'created_at', order = 'desc' } = query;
    const offset = (page - 1) * limit;

    const sortColumn = this.ALLOWED_SORTS.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const conditions: string[] = ['rp.deleted_at IS NULL'];
    const params: any[] = [];
    let paramIndex = 1;

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
              rt.name as repair_type_name
       FROM repair_projects rp
       LEFT JOIN repair_types rt ON rp.repair_type_id = rt.id
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
              c.company_name as contractor_name,
              f.name as facility_name
       FROM repair_projects rp
       LEFT JOIN projects p ON rp.project_id = p.id
       LEFT JOIN repair_types rt ON rp.repair_type_id = rt.id
       LEFT JOIN contractors c ON rp.contractor_id = c.id
       LEFT JOIN facilities f ON rp.facility_id = f.id
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

  async create(dto: CreateRepairProjectDto, userId: string): Promise<any> {
    // Verify project_id exists
    const projectCheck = await this.db.query(
      `SELECT id FROM projects WHERE id = $1 AND deleted_at IS NULL`,
      [dto.project_id],
    );
    if (projectCheck.rows.length === 0) {
      throw new BadRequestException(`Project with ID ${dto.project_id} not found`);
    }

    // Check for duplicate project_code
    const existing = await this.db.query(
      `SELECT id FROM repair_projects WHERE project_code = $1 AND deleted_at IS NULL`,
      [dto.project_code],
    );
    if (existing.rows.length > 0) {
      throw new ConflictException(`Project code ${dto.project_code} already exists`);
    }

    const result = await this.db.query(
      `INSERT INTO repair_projects
       (project_id, project_code, title, description, building_name, floor_number, room_number,
        specific_location, repair_type_id, urgency_level, is_emergency, campus, reported_by,
        inspection_date, inspector_id, inspection_findings, status, start_date, end_date,
        budget, project_manager_id, contractor_id, facility_id, assigned_technician, metadata, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
       RETURNING *`,
      [
        dto.project_id, dto.project_code, dto.title, dto.description, dto.building_name,
        dto.floor_number, dto.room_number, dto.specific_location, dto.repair_type_id,
        dto.urgency_level, dto.is_emergency || false, dto.campus, dto.reported_by,
        dto.inspection_date, dto.inspector_id, dto.inspection_findings, dto.status,
        dto.start_date, dto.end_date, dto.budget, dto.project_manager_id, dto.contractor_id,
        dto.facility_id, dto.assigned_technician, dto.metadata ? JSON.stringify(dto.metadata) : null, userId,
      ],
    );

    this.logger.log(`REPAIR_PROJECT_CREATED: id=${result.rows[0].id}, by=${userId}`);
    return result.rows[0];
  }

  async update(id: string, dto: UpdateRepairProjectDto, userId: string): Promise<any> {
    await this.findOne(id);

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

    const fields = Object.keys(dto).filter((k) => dto[k] !== undefined);
    if (fields.length === 0) return this.findOne(id);

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map((f) => (f === 'metadata' ? JSON.stringify(dto[f]) : dto[f]));

    const result = await this.db.query(
      `UPDATE repair_projects SET ${setClause}, updated_by = $${fields.length + 1}, updated_at = NOW()
       WHERE id = $${fields.length + 2} AND deleted_at IS NULL RETURNING *`,
      [...values, userId, id],
    );

    this.logger.log(`REPAIR_PROJECT_UPDATED: id=${id}, by=${userId}, fields=[${fields.join(',')}]`);
    return result.rows[0];
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id);
    await this.db.query(
      `UPDATE repair_projects SET deleted_at = NOW(), deleted_by = $1 WHERE id = $2`,
      [userId, id],
    );
    this.logger.log(`REPAIR_PROJECT_DELETED: id=${id}, by=${userId}`);
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
