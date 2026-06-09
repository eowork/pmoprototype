import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { createPaginatedResponse, PaginatedResponse } from '../common/dto';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  QueryDepartmentDto,
  AssignUserDto,
} from './dto';
import { Department, UserDepartment } from '../database/entities';

@Injectable()
export class DepartmentsService {
  private readonly logger = new Logger(DepartmentsService.name);
  private readonly ALLOWED_SORTS = [
    'created_at',
    'updated_at',
    'name',
    'status',
    'code',
  ];

  constructor(
    @InjectRepository(Department)
    private readonly deptRepo: EntityRepository<Department>,
    @InjectRepository(UserDepartment)
    private readonly userDeptRepo: EntityRepository<UserDepartment>,
    private readonly em: EntityManager,
  ) {}

  async findAll(query: QueryDepartmentDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20, sort = 'created_at', order = 'desc' } = query;
    const offset = (page - 1) * limit;

    const sortColumn = this.ALLOWED_SORTS.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const conditions: string[] = ['d.deleted_at IS NULL'];
    const params: any[] = [];

    if (query.status) {
      conditions.push(`d.status = ?`);
      params.push(query.status);
    }

    if (query.parent_id) {
      conditions.push(`d.parent_id = ?`);
      params.push(query.parent_id);
    }

    if (query.name) {
      conditions.push(`d.name ILIKE ?`);
      params.push(`%${query.name}%`);
    }

    const whereClause = conditions.join(' AND ');

    const conn = this.em.getConnection();

    const countResult = await conn.execute(
      `SELECT COUNT(*) FROM departments d WHERE ${whereClause}`,
      params,
    );
    const total = parseInt(countResult[0].count, 10);

    const dataResult = await conn.execute(
      `SELECT d.id, d.name, d.code, d.description, d.parent_id, d.head_id,
              d.email, d.phone, d.status, d.created_at, d.updated_at,
              u.first_name || ' ' || u.last_name as head_name,
              p.name as parent_name
       FROM departments d
       LEFT JOIN users u ON d.head_id = u.id
       LEFT JOIN departments p ON d.parent_id = p.id
       WHERE ${whereClause}
       ORDER BY d.${sortColumn} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    return createPaginatedResponse(dataResult, total, page, limit);
  }

  async findOne(id: string): Promise<any> {
    const conn = this.em.getConnection();
    const result = await conn.execute(
      `SELECT d.*,
              u.first_name || ' ' || u.last_name as head_name,
              u.email as head_email,
              p.name as parent_name
       FROM departments d
       LEFT JOIN users u ON d.head_id = u.id
       LEFT JOIN departments p ON d.parent_id = p.id
       WHERE d.id = ? AND d.deleted_at IS NULL`,
      [id],
    );

    if (result.length === 0) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return result[0];
  }

  async create(dto: CreateDepartmentDto, userId: string): Promise<any> {
    const conn = this.em.getConnection();

    // Check for duplicate code if provided
    if (dto.code) {
      const existing = await this.deptRepo.findOne({ code: dto.code });
      if (existing) {
        throw new ConflictException(
          `Department code ${dto.code} already exists`,
        );
      }
    }

    // Validate parent_id if provided
    if (dto.parent_id) {
      const parent = await this.deptRepo.findOne({ id: dto.parent_id });
      if (!parent) {
        throw new BadRequestException(
          `Parent department with ID ${dto.parent_id} not found`,
        );
      }
    }

    // Validate head_id if provided (users table — no entity, use raw)
    if (dto.head_id) {
      const head = await conn.execute(
        `SELECT id FROM users WHERE id = ? AND deleted_at IS NULL`,
        [dto.head_id],
      );
      if (head.length === 0) {
        throw new BadRequestException(`User with ID ${dto.head_id} not found`);
      }
    }

    const entity = this.deptRepo.create({
      name: dto.name,
      code: dto.code,
      description: dto.description,
      parentId: dto.parent_id,
      headId: dto.head_id,
      email: dto.email,
      phone: dto.phone,
      status: dto.status || 'ACTIVE',
      metadata: dto.metadata,
      createdBy: userId,
    });

    await this.em.persist(entity).flush();
    this.logger.log(`DEPARTMENT_CREATED: id=${entity.id}, by=${userId}`);
    return entity;
  }

  async update(
    id: string,
    dto: UpdateDepartmentDto,
    userId: string,
  ): Promise<any> {
    await this.findOne(id);
    const entity = await this.deptRepo.findOne({ id });
    if (!entity)
      throw new NotFoundException(`Department with ID ${id} not found`);

    const conn = this.em.getConnection();

    // Check for duplicate code if updating
    if (dto.code) {
      const existing = await this.deptRepo.findOne({
        code: dto.code,
        id: { $ne: id },
      });
      if (existing) {
        throw new ConflictException(
          `Department code ${dto.code} already exists`,
        );
      }
    }

    // Validate parent_id if provided and check for cycles
    if (dto.parent_id) {
      if (dto.parent_id === id) {
        throw new BadRequestException('Department cannot be its own parent');
      }
      const parent = await this.deptRepo.findOne({ id: dto.parent_id });
      if (!parent) {
        throw new BadRequestException(
          `Parent department with ID ${dto.parent_id} not found`,
        );
      }
      const hasCycle = await this.checkCycle(id, dto.parent_id);
      if (hasCycle) {
        throw new BadRequestException(
          'Setting this parent would create a circular reference',
        );
      }
    }

    // Validate head_id if provided
    if (dto.head_id) {
      const head = await conn.execute(
        `SELECT id FROM users WHERE id = ? AND deleted_at IS NULL`,
        [dto.head_id],
      );
      if (head.length === 0) {
        throw new BadRequestException(`User with ID ${dto.head_id} not found`);
      }
    }

    if (dto.name !== undefined) entity.name = dto.name;
    if (dto.code !== undefined) entity.code = dto.code;
    if (dto.description !== undefined) entity.description = dto.description;
    if (dto.parent_id !== undefined) entity.parentId = dto.parent_id;
    if (dto.head_id !== undefined) entity.headId = dto.head_id;
    if (dto.email !== undefined) entity.email = dto.email;
    if (dto.phone !== undefined) entity.phone = dto.phone;
    if (dto.status !== undefined) entity.status = dto.status;
    if (dto.metadata !== undefined) entity.metadata = dto.metadata;
    entity.updatedBy = userId;

    await this.em.flush();

    const fields = Object.keys(dto).filter(
      (k) => (dto as any)[k] !== undefined,
    );
    this.logger.log(
      `DEPARTMENT_UPDATED: id=${id}, by=${userId}, fields=[${fields.join(',')}]`,
    );
    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id);

    // Check if department has children
    const children = await this.deptRepo.findOne({ parentId: id });
    if (children) {
      throw new BadRequestException(
        'Cannot delete department with child departments',
      );
    }

    const entity = await this.deptRepo.findOne({ id });
    if (!entity)
      throw new NotFoundException(`Department with ID ${id} not found`);

    entity.deletedAt = new Date();
    entity.deletedBy = userId;
    await this.em.flush();

    this.logger.log(`DEPARTMENT_DELETED: id=${id}, by=${userId}`);
  }

  // --- User Assignment ---
  async findUsers(departmentId: string): Promise<any[]> {
    await this.findOne(departmentId);

    const conn = this.em.getConnection();
    const result = await conn.execute(
      `SELECT ud.user_id, ud.is_primary, ud.created_at,
              u.email, u.first_name, u.last_name
       FROM user_departments ud
       JOIN users u ON ud.user_id = u.id
       WHERE ud.department_id = ? AND u.deleted_at IS NULL
       ORDER BY ud.is_primary DESC, u.last_name ASC`,
      [departmentId],
    );

    return result;
  }

  async assignUser(
    departmentId: string,
    dto: AssignUserDto,
    userId: string,
  ): Promise<any> {
    await this.findOne(departmentId);

    const conn = this.em.getConnection();

    // Check if user exists
    const user = await conn.execute(
      `SELECT id FROM users WHERE id = ? AND deleted_at IS NULL`,
      [dto.user_id],
    );
    if (user.length === 0) {
      throw new BadRequestException(`User with ID ${dto.user_id} not found`);
    }

    // Check if already assigned
    const existing = await this.userDeptRepo.findOne({
      userId: dto.user_id,
      departmentId,
    });
    if (existing) {
      throw new ConflictException(
        `User is already assigned to this department`,
      );
    }

    const entity = this.userDeptRepo.create({
      userId: dto.user_id,
      departmentId,
      isPrimary: dto.is_primary || false,
      createdBy: userId,
    });

    await this.em.persist(entity).flush();
    this.logger.log(
      `USER_ASSIGNED_TO_DEPARTMENT: user=${dto.user_id}, department=${departmentId}, by=${userId}`,
    );
    return entity;
  }

  async removeUser(
    departmentId: string,
    targetUserId: string,
    userId: string,
  ): Promise<void> {
    await this.findOne(departmentId);

    const count = await this.userDeptRepo.nativeDelete({
      userId: targetUserId,
      departmentId,
    });

    if (count === 0) {
      throw new NotFoundException(`User is not assigned to this department`);
    }

    this.logger.log(
      `USER_REMOVED_FROM_DEPARTMENT: user=${targetUserId}, department=${departmentId}, by=${userId}`,
    );
  }

  // --- Helper Methods ---
  private async checkCycle(
    departmentId: string,
    newParentId: string,
  ): Promise<boolean> {
    let currentId = newParentId;
    const visited = new Set<string>();

    while (currentId) {
      if (currentId === departmentId) {
        return true;
      }
      if (visited.has(currentId)) {
        return false;
      }
      visited.add(currentId);

      const dept = await this.deptRepo.findOne(
        { id: currentId },
        { filters: false },
      );

      if (!dept) {
        return false;
      }

      currentId = dept.parentId as string;
    }

    return false;
  }
}
