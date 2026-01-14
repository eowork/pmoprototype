import {
  Injectable,
  NotFoundException,
  ConflictException,
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

@Injectable()
export class UniversityOperationsService {
  private readonly logger = new Logger(UniversityOperationsService.name);

  // Allowlisted columns for filtering/sorting
  private readonly ALLOWED_SORTS = ['created_at', 'title', 'status', 'start_date', 'end_date'];

  constructor(private readonly db: DatabaseService) {}

  async findAll(query: QueryOperationDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20, sort = 'created_at', order = 'desc' } = query;
    const offset = (page - 1) * limit;

    // Validate sort column
    const sortColumn = this.ALLOWED_SORTS.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Build WHERE clause
    const conditions: string[] = ['deleted_at IS NULL'];
    const params: any[] = [];
    let paramIndex = 1;

    if (query.type) {
      conditions.push(`operation_type = $${paramIndex++}`);
      params.push(query.type);
    }
    if (query.status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(query.status);
    }
    if (query.campus) {
      conditions.push(`campus = $${paramIndex++}`);
      params.push(query.campus);
    }
    if (query.coordinator_id) {
      conditions.push(`coordinator_id = $${paramIndex++}`);
      params.push(query.coordinator_id);
    }

    const whereClause = conditions.join(' AND ');

    // Get total count
    const countResult = await this.db.query(
      `SELECT COUNT(*) FROM university_operations WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Get paginated data
    const dataResult = await this.db.query(
      `SELECT id, operation_type, title, description, code, start_date, end_date,
              status, budget, campus, coordinator_id, created_at, updated_at
       FROM university_operations
       WHERE ${whereClause}
       ORDER BY ${sortColumn} ${sortOrder}
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset],
    );

    return createPaginatedResponse(dataResult.rows, total, page, limit);
  }

  async findOne(id: string): Promise<any> {
    const result = await this.db.query(
      `SELECT * FROM university_operations WHERE id = $1 AND deleted_at IS NULL`,
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

  async create(dto: CreateOperationDto, userId: string): Promise<any> {
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

    const result = await this.db.query(
      `INSERT INTO university_operations
       (operation_type, title, description, code, start_date, end_date, status, budget, campus, coordinator_id, metadata, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
      ],
    );

    this.logger.log(`OPERATION_CREATED: id=${result.rows[0].id}, by=${userId}`);
    return result.rows[0];
  }

  async update(id: string, dto: UpdateOperationDto, userId: string): Promise<any> {
    // Check exists
    await this.findOne(id);

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

    // Build dynamic SET clause
    const fields = Object.keys(dto).filter((k) => dto[k] !== undefined);
    if (fields.length === 0) {
      return this.findOne(id);
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map((f) => (f === 'metadata' ? JSON.stringify(dto[f]) : dto[f]));

    const result = await this.db.query(
      `UPDATE university_operations
       SET ${setClause}, updated_by = $${fields.length + 1}, updated_at = NOW()
       WHERE id = $${fields.length + 2} AND deleted_at IS NULL
       RETURNING *`,
      [...values, userId, id],
    );

    this.logger.log(`OPERATION_UPDATED: id=${id}, by=${userId}, fields=[${fields.join(',')}]`);
    return result.rows[0];
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id);

    await this.db.query(
      `UPDATE university_operations SET deleted_at = NOW(), deleted_by = $1 WHERE id = $2`,
      [userId, id],
    );

    this.logger.log(`OPERATION_DELETED: id=${id}, by=${userId}`);
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
