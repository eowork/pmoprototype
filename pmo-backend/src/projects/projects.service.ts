import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import type { FilterQuery } from '@mikro-orm/core';
import { createPaginatedResponse, PaginatedResponse } from '../common/dto';
import { CreateProjectDto, UpdateProjectDto, QueryProjectDto } from './dto';
import { Project } from '../database/entities';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);
  private readonly ALLOWED_SORTS = [
    'createdAt',
    'title',
    'status',
    'startDate',
    'endDate',
    'projectCode',
  ];

  constructor(
    @InjectRepository(Project)
    private readonly repo: EntityRepository<Project>,
    private readonly em: EntityManager,
  ) {}

  async findAll(query: QueryProjectDto): Promise<PaginatedResponse<Project>> {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = query;

    const sortKey = this.ALLOWED_SORTS.includes(sort) ? sort : 'createdAt';
    const sortOrder = (order.toLowerCase() === 'asc' ? 'asc' : 'desc') as
      | 'asc'
      | 'desc';

    const where: FilterQuery<Project> = {};
    if (query.type) where.projectType = query.type;
    if (query.status) where.status = query.status;
    if (query.campus) where.campus = query.campus;

    const [items, total] = await this.repo.findAndCount(where, {
      limit,
      offset: (page - 1) * limit,
      orderBy: { [sortKey]: sortOrder },
    });

    return createPaginatedResponse(items, total, page, limit);
  }

  async findOne(id: string): Promise<Project> {
    const entity = await this.repo.findOne({ id });
    if (!entity) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return entity;
  }

  async create(dto: CreateProjectDto, userId: string): Promise<Project> {
    const existing = await this.repo.findOne({ projectCode: dto.project_code });
    if (existing) {
      throw new ConflictException(
        `Project code ${dto.project_code} already exists`,
      );
    }

    const entity = this.repo.create({
      projectCode: dto.project_code,
      title: dto.title,
      description: dto.description,
      projectType: dto.project_type,
      startDate: dto.start_date ? new Date(dto.start_date) : undefined,
      endDate: dto.end_date ? new Date(dto.end_date) : undefined,
      status: dto.status,
      budget: dto.budget != null ? String(dto.budget) : undefined,
      campus: dto.campus,
      metadata: dto.metadata,
      createdBy: userId,
    });

    await this.em.persist(entity).flush();
    this.logger.log(`PROJECT_CREATED: id=${entity.id}, by=${userId}`);
    return entity;
  }

  async update(
    id: string,
    dto: UpdateProjectDto,
    userId: string,
  ): Promise<Project> {
    const entity = await this.findOne(id);

    const dtoAny = dto as any;
    if (dtoAny.project_code && dtoAny.project_code !== entity.projectCode) {
      const existing = await this.repo.findOne({
        projectCode: dtoAny.project_code,
        id: { $ne: id },
      });
      if (existing) {
        throw new ConflictException(
          `Project code ${dtoAny.project_code} already exists`,
        );
      }
    }

    if (dtoAny.project_code !== undefined)
      entity.projectCode = dtoAny.project_code;
    if (dto.title !== undefined) entity.title = dto.title;
    if (dto.description !== undefined) entity.description = dto.description;
    if (dtoAny.project_type !== undefined)
      entity.projectType = dtoAny.project_type;
    if (dtoAny.start_date !== undefined)
      entity.startDate = dtoAny.start_date
        ? new Date(dtoAny.start_date)
        : undefined;
    if (dtoAny.end_date !== undefined)
      entity.endDate = dtoAny.end_date ? new Date(dtoAny.end_date) : undefined;
    if (dto.status !== undefined) entity.status = dto.status;
    if (dto.budget !== undefined)
      entity.budget = dto.budget != null ? String(dto.budget) : undefined;
    if (dto.campus !== undefined) entity.campus = dto.campus;
    if (dto.metadata !== undefined) entity.metadata = dto.metadata;
    entity.updatedBy = userId;

    await this.em.flush();

    const fields = Object.keys(dto).filter(
      (k) => (dto as any)[k] !== undefined,
    );
    this.logger.log(
      `PROJECT_UPDATED: id=${id}, by=${userId}, fields=[${fields.join(',')}]`,
    );
    return entity;
  }

  async remove(id: string, userId: string): Promise<void> {
    const entity = await this.findOne(id);
    entity.deletedAt = new Date();
    entity.deletedBy = userId;
    await this.em.flush();
    this.logger.log(`PROJECT_DELETED: id=${id}, by=${userId}`);
  }
}
