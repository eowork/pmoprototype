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
  CreateConstructionProjectDto,
  UpdateConstructionProjectDto,
  QueryConstructionProjectDto,
  CreateMilestoneDto,
  CreateConstructionFinancialDto,
} from './dto';

@Injectable()
export class ConstructionProjectsService {
  private readonly logger = new Logger(ConstructionProjectsService.name);
  private readonly ALLOWED_SORTS = ['created_at', 'title', 'status', 'start_date', 'target_completion_date', 'physical_progress'];

  constructor(private readonly db: DatabaseService) {}

  async findAll(query: QueryConstructionProjectDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20, sort = 'created_at', order = 'desc' } = query;
    const offset = (page - 1) * limit;

    const sortColumn = this.ALLOWED_SORTS.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const conditions: string[] = ['cp.deleted_at IS NULL'];
    const params: any[] = [];
    let paramIndex = 1;

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
              cp.contractor_id, cp.funding_source_id, cp.created_at
       FROM construction_projects cp
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
              c.company_name as contractor_name,
              fs.name as funding_source_name
       FROM construction_projects cp
       LEFT JOIN projects p ON cp.project_id = p.id
       LEFT JOIN contractors c ON cp.contractor_id = c.id
       LEFT JOIN funding_sources fs ON cp.funding_source_id = fs.id
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

  async create(dto: CreateConstructionProjectDto, userId: string): Promise<any> {
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
      `SELECT id FROM construction_projects WHERE project_code = $1 AND deleted_at IS NULL`,
      [dto.project_code],
    );
    if (existing.rows.length > 0) {
      throw new ConflictException(`Project code ${dto.project_code} already exists`);
    }

    const result = await this.db.query(
      `INSERT INTO construction_projects
       (project_id, project_code, title, description, ideal_infrastructure_image, beneficiaries,
        objectives, key_features, original_contract_duration, contract_number, contractor_id,
        contract_amount, start_date, target_completion_date, project_duration, project_engineer,
        project_manager, building_type, floor_area, number_of_floors, funding_source_id,
        subcategory_id, campus, status, latitude, longitude, metadata, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
       RETURNING *`,
      [
        dto.project_id,
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
      ],
    );

    this.logger.log(`CONSTRUCTION_PROJECT_CREATED: id=${result.rows[0].id}, by=${userId}`);
    return result.rows[0];
  }

  async update(id: string, dto: UpdateConstructionProjectDto, userId: string): Promise<any> {
    await this.findOne(id);

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

    const fields = Object.keys(dto).filter((k) => dto[k] !== undefined);
    if (fields.length === 0) {
      return this.findOne(id);
    }

    const jsonFields = ['objectives', 'key_features', 'metadata'];
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map((f) => (jsonFields.includes(f) ? JSON.stringify(dto[f]) : dto[f]));

    const result = await this.db.query(
      `UPDATE construction_projects
       SET ${setClause}, updated_by = $${fields.length + 1}, updated_at = NOW()
       WHERE id = $${fields.length + 2} AND deleted_at IS NULL
       RETURNING *`,
      [...values, userId, id],
    );

    this.logger.log(`CONSTRUCTION_PROJECT_UPDATED: id=${id}, by=${userId}, fields=[${fields.join(',')}]`);
    return result.rows[0];
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id);

    await this.db.query(
      `UPDATE construction_projects SET deleted_at = NOW(), deleted_by = $1 WHERE id = $2`,
      [userId, id],
    );

    this.logger.log(`CONSTRUCTION_PROJECT_DELETED: id=${id}, by=${userId}`);
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
}
