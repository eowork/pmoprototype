import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { createPaginatedResponse, PaginatedResponse } from '../common/dto';
import {
  CreateStudentParityDto, CreateFacultyParityDto, CreateStaffParityDto,
  CreatePwdParityDto, CreateIndigenousParityDto, ReviewParityDto,
  CreateGpbAccomplishmentDto, CreateBudgetPlanDto,
  QueryParityDto, QueryPlanningDto,
} from './dto';

@Injectable()
export class GadService {
  private readonly logger = new Logger(GadService.name);

  constructor(private readonly db: DatabaseService) {}

  // --- Generic CRUD helpers ---
  private async findAllParity(table: string, query: QueryParityDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20 } = query;
    const offset = (page - 1) * limit;
    const conditions: string[] = ['deleted_at IS NULL'];
    const params: any[] = [];
    let idx = 1;

    if (query.academic_year) { conditions.push(`academic_year = $${idx++}`); params.push(query.academic_year); }
    if (query.status) { conditions.push(`status = $${idx++}`); params.push(query.status); }

    const where = conditions.join(' AND ');
    const countRes = await this.db.query(`SELECT COUNT(*) FROM ${table} WHERE ${where}`, params);
    const total = parseInt(countRes.rows[0].count, 10);
    const dataRes = await this.db.query(
      `SELECT * FROM ${table} WHERE ${where} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx}`,
      [...params, limit, offset],
    );
    return createPaginatedResponse(dataRes.rows, total, page, limit);
  }

  private async createParity(table: string, columns: string[], values: any[], userId: string): Promise<any> {
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const result = await this.db.query(
      `INSERT INTO ${table} (${columns.join(', ')}, submitted_by) VALUES (${placeholders}, $${columns.length + 1}) RETURNING *`,
      [...values, userId],
    );
    this.logger.log(`GAD_PARITY_CREATED: table=${table}, id=${result.rows[0].id}, by=${userId}`);
    return result.rows[0];
  }

  private async updateParity(table: string, id: string, dto: any, userId: string): Promise<any> {
    const fields = Object.keys(dto).filter(k => dto[k] !== undefined);
    if (fields.length === 0) {
      const current = await this.db.query(`SELECT * FROM ${table} WHERE id = $1 AND deleted_at IS NULL`, [id]);
      if (current.rows.length === 0) throw new NotFoundException(`Record ${id} not found`);
      return current.rows[0];
    }
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map(f => dto[f]);
    const result = await this.db.query(
      `UPDATE ${table} SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} AND deleted_at IS NULL RETURNING *`,
      [...values, id],
    );
    if (result.rows.length === 0) throw new NotFoundException(`Record ${id} not found`);
    this.logger.log(`GAD_PARITY_UPDATED: table=${table}, id=${id}, by=${userId}`);
    return result.rows[0];
  }

  private async removeParity(table: string, id: string): Promise<void> {
    const result = await this.db.query(`UPDATE ${table} SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`, [id]);
    if (result.rowCount === 0) throw new NotFoundException(`Record ${id} not found`);
    this.logger.log(`GAD_PARITY_DELETED: table=${table}, id=${id}`);
  }

  private async reviewParity(table: string, id: string, dto: ReviewParityDto, userId: string): Promise<any> {
    const result = await this.db.query(
      `UPDATE ${table} SET status = $1, reviewed_by = $2, reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $3 AND deleted_at IS NULL RETURNING *`,
      [dto.status, userId, id],
    );
    if (result.rows.length === 0) throw new NotFoundException(`Record ${id} not found`);
    this.logger.log(`GAD_PARITY_REVIEWED: table=${table}, id=${id}, status=${dto.status}, by=${userId}`);
    return result.rows[0];
  }

  // --- Student Parity ---
  findStudentParity(query: QueryParityDto) { return this.findAllParity('gad_student_parity_data', query); }
  createStudentParity(dto: CreateStudentParityDto, userId: string) {
    return this.createParity('gad_student_parity_data',
      ['academic_year', 'program', 'admission_male', 'admission_female', 'graduation_male', 'graduation_female'],
      [dto.academic_year, dto.program, dto.admission_male || 0, dto.admission_female || 0, dto.graduation_male || 0, dto.graduation_female || 0],
      userId);
  }
  updateStudentParity(id: string, dto: Partial<CreateStudentParityDto>, userId: string) {
    return this.updateParity('gad_student_parity_data', id, dto, userId);
  }
  removeStudentParity(id: string) { return this.removeParity('gad_student_parity_data', id); }
  reviewStudentParity(id: string, dto: ReviewParityDto, userId: string) {
    return this.reviewParity('gad_student_parity_data', id, dto, userId);
  }

  // --- Faculty Parity ---
  findFacultyParity(query: QueryParityDto) { return this.findAllParity('gad_faculty_parity_data', query); }
  createFacultyParity(dto: CreateFacultyParityDto, userId: string) {
    return this.createParity('gad_faculty_parity_data',
      ['academic_year', 'college', 'category', 'total_faculty', 'male_count', 'female_count', 'gender_balance'],
      [dto.academic_year, dto.college, dto.category, dto.total_faculty || 0, dto.male_count || 0, dto.female_count || 0, dto.gender_balance],
      userId);
  }
  updateFacultyParity(id: string, dto: Partial<CreateFacultyParityDto>, userId: string) {
    return this.updateParity('gad_faculty_parity_data', id, dto, userId);
  }
  removeFacultyParity(id: string) { return this.removeParity('gad_faculty_parity_data', id); }
  reviewFacultyParity(id: string, dto: ReviewParityDto, userId: string) {
    return this.reviewParity('gad_faculty_parity_data', id, dto, userId);
  }

  // --- Staff Parity ---
  findStaffParity(query: QueryParityDto) { return this.findAllParity('gad_staff_parity_data', query); }
  createStaffParity(dto: CreateStaffParityDto, userId: string) {
    return this.createParity('gad_staff_parity_data',
      ['academic_year', 'department', 'staff_category', 'total_staff', 'male_count', 'female_count', 'gender_balance'],
      [dto.academic_year, dto.department, dto.staff_category, dto.total_staff || 0, dto.male_count || 0, dto.female_count || 0, dto.gender_balance],
      userId);
  }
  updateStaffParity(id: string, dto: Partial<CreateStaffParityDto>, userId: string) {
    return this.updateParity('gad_staff_parity_data', id, dto, userId);
  }
  removeStaffParity(id: string) { return this.removeParity('gad_staff_parity_data', id); }
  reviewStaffParity(id: string, dto: ReviewParityDto, userId: string) {
    return this.reviewParity('gad_staff_parity_data', id, dto, userId);
  }

  // --- PWD Parity ---
  findPwdParity(query: QueryParityDto) { return this.findAllParity('gad_pwd_parity_data', query); }
  createPwdParity(dto: CreatePwdParityDto, userId: string) {
    return this.createParity('gad_pwd_parity_data',
      ['academic_year', 'pwd_category', 'subcategory', 'total_beneficiaries', 'male_count', 'female_count'],
      [dto.academic_year, dto.pwd_category, dto.subcategory, dto.total_beneficiaries || 0, dto.male_count || 0, dto.female_count || 0],
      userId);
  }
  updatePwdParity(id: string, dto: Partial<CreatePwdParityDto>, userId: string) {
    return this.updateParity('gad_pwd_parity_data', id, dto, userId);
  }
  removePwdParity(id: string) { return this.removeParity('gad_pwd_parity_data', id); }
  reviewPwdParity(id: string, dto: ReviewParityDto, userId: string) {
    return this.reviewParity('gad_pwd_parity_data', id, dto, userId);
  }

  // --- Indigenous Parity ---
  findIndigenousParity(query: QueryParityDto) { return this.findAllParity('gad_indigenous_parity_data', query); }
  createIndigenousParity(dto: CreateIndigenousParityDto, userId: string) {
    return this.createParity('gad_indigenous_parity_data',
      ['academic_year', 'indigenous_category', 'subcategory', 'total_participants', 'male_count', 'female_count'],
      [dto.academic_year, dto.indigenous_category, dto.subcategory, dto.total_participants || 0, dto.male_count || 0, dto.female_count || 0],
      userId);
  }
  updateIndigenousParity(id: string, dto: Partial<CreateIndigenousParityDto>, userId: string) {
    return this.updateParity('gad_indigenous_parity_data', id, dto, userId);
  }
  removeIndigenousParity(id: string) { return this.removeParity('gad_indigenous_parity_data', id); }
  reviewIndigenousParity(id: string, dto: ReviewParityDto, userId: string) {
    return this.reviewParity('gad_indigenous_parity_data', id, dto, userId);
  }

  // --- GPB Accomplishments ---
  async findGpbAccomplishments(query: QueryPlanningDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20 } = query;
    const offset = (page - 1) * limit;
    const conditions: string[] = ['deleted_at IS NULL'];
    const params: any[] = [];
    let idx = 1;

    if (query.year) { conditions.push(`year = $${idx++}`); params.push(query.year); }
    if (query.category) { conditions.push(`category = $${idx++}`); params.push(query.category); }
    if (query.status) { conditions.push(`status = $${idx++}`); params.push(query.status); }

    const where = conditions.join(' AND ');
    const countRes = await this.db.query(`SELECT COUNT(*) FROM gad_gpb_accomplishments WHERE ${where}`, params);
    const total = parseInt(countRes.rows[0].count, 10);
    const dataRes = await this.db.query(
      `SELECT * FROM gad_gpb_accomplishments WHERE ${where} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx}`,
      [...params, limit, offset],
    );
    return createPaginatedResponse(dataRes.rows, total, page, limit);
  }

  async createGpbAccomplishment(dto: CreateGpbAccomplishmentDto, userId: string): Promise<any> {
    const result = await this.db.query(
      `INSERT INTO gad_gpb_accomplishments (title, description, category, priority, status, target_beneficiaries, actual_beneficiaries, target_budget, actual_budget, year, responsible, submitted_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [dto.title, dto.description, dto.category, dto.priority, dto.status, dto.target_beneficiaries, dto.actual_beneficiaries, dto.target_budget, dto.actual_budget, dto.year, dto.responsible, userId],
    );
    this.logger.log(`GPB_ACCOMPLISHMENT_CREATED: id=${result.rows[0].id}, by=${userId}`);
    return result.rows[0];
  }

  async updateGpbAccomplishment(id: string, dto: Partial<CreateGpbAccomplishmentDto>, userId: string): Promise<any> {
    return this.updateParity('gad_gpb_accomplishments', id, dto, userId);
  }

  // --- Budget Plans ---
  async findBudgetPlans(query: QueryPlanningDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20 } = query;
    const offset = (page - 1) * limit;
    const conditions: string[] = ['deleted_at IS NULL'];
    const params: any[] = [];
    let idx = 1;

    if (query.year) { conditions.push(`year = $${idx++}`); params.push(query.year); }
    if (query.category) { conditions.push(`category = $${idx++}`); params.push(query.category); }
    if (query.status) { conditions.push(`status = $${idx++}`); params.push(query.status); }

    const where = conditions.join(' AND ');
    const countRes = await this.db.query(`SELECT COUNT(*) FROM gad_budget_plans WHERE ${where}`, params);
    const total = parseInt(countRes.rows[0].count, 10);
    const dataRes = await this.db.query(
      `SELECT * FROM gad_budget_plans WHERE ${where} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx}`,
      [...params, limit, offset],
    );
    return createPaginatedResponse(dataRes.rows, total, page, limit);
  }

  async createBudgetPlan(dto: CreateBudgetPlanDto, userId: string): Promise<any> {
    const result = await this.db.query(
      `INSERT INTO gad_budget_plans (title, description, category, priority, status, budget_allocated, budget_utilized, target_beneficiaries, start_date, end_date, year, responsible, submitted_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [dto.title, dto.description, dto.category, dto.priority, dto.status, dto.budget_allocated, dto.budget_utilized, dto.target_beneficiaries, dto.start_date, dto.end_date, dto.year, dto.responsible, userId],
    );
    this.logger.log(`BUDGET_PLAN_CREATED: id=${result.rows[0].id}, by=${userId}`);
    return result.rows[0];
  }

  async updateBudgetPlan(id: string, dto: Partial<CreateBudgetPlanDto>, userId: string): Promise<any> {
    return this.updateParity('gad_budget_plans', id, dto, userId);
  }
}
