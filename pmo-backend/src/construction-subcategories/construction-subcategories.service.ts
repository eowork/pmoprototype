import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import type { FilterQuery } from '@mikro-orm/core';
import { createPaginatedResponse, PaginatedResponse } from '../common/dto';
import {
  CreateConstructionSubcategoryDto,
  UpdateConstructionSubcategoryDto,
  QueryConstructionSubcategoryDto,
} from './dto';
import { ConstructionSubcategory } from '../database/entities';

@Injectable()
export class ConstructionSubcategoriesService {
  private readonly logger = new Logger(ConstructionSubcategoriesService.name);
  private readonly ALLOWED_SORTS = ['createdAt', 'updatedAt', 'name'];

  constructor(
    @InjectRepository(ConstructionSubcategory)
    private readonly repo: EntityRepository<ConstructionSubcategory>,
  ) {}

  async findAll(
    query: QueryConstructionSubcategoryDto,
  ): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = query;

    const sortKey = this.ALLOWED_SORTS.includes(sort) ? sort : 'createdAt';
    const sortOrder = (order.toLowerCase() === 'asc' ? 'asc' : 'desc') as
      | 'asc'
      | 'desc';

    const where: FilterQuery<ConstructionSubcategory> = {};
    if (query.name) {
      where.name = { $ilike: `%${query.name}%` };
    }

    const [items, total] = await this.repo.findAndCount(where, {
      limit,
      offset: (page - 1) * limit,
      orderBy: { [sortKey]: sortOrder },
    });

    return createPaginatedResponse(items, total, page, limit);
  }

  async findOne(id: string): Promise<ConstructionSubcategory> {
    const item = await this.repo.findOne({ id });
    if (!item) {
      throw new NotFoundException(
        `Construction subcategory with ID ${id} not found`,
      );
    }
    return item;
  }

  async create(
    dto: CreateConstructionSubcategoryDto,
    userId: string,
  ): Promise<ConstructionSubcategory> {
    const existing = await this.repo.findOne({ name: dto.name });
    if (existing) {
      throw new ConflictException(
        `Construction subcategory name ${dto.name} already exists`,
      );
    }

    const entity = this.repo.create({
      name: dto.name,
      description: dto.description,
      metadata: dto.metadata,
      createdBy: userId,
    });

    await this.repo.getEntityManager().persist(entity).flush();
    this.logger.log(
      `CONSTRUCTION_SUBCATEGORY_CREATED: id=${entity.id}, by=${userId}`,
    );
    return entity;
  }

  async update(
    id: string,
    dto: UpdateConstructionSubcategoryDto,
    userId: string,
  ): Promise<ConstructionSubcategory> {
    const entity = await this.findOne(id);

    if (dto.name && dto.name !== entity.name) {
      const existing = await this.repo.findOne({
        name: dto.name,
        id: { $ne: id },
      });
      if (existing) {
        throw new ConflictException(
          `Construction subcategory name ${dto.name} already exists`,
        );
      }
    }

    const fields = Object.keys(dto).filter(
      (k) => (dto as any)[k] !== undefined,
    );
    if (fields.length === 0) {
      return entity;
    }

    Object.assign(entity, { ...dto, updatedBy: userId });
    await this.repo.getEntityManager().flush();
    this.logger.log(
      `CONSTRUCTION_SUBCATEGORY_UPDATED: id=${id}, by=${userId}, fields=[${fields.join(',')}]`,
    );
    return entity;
  }

  async remove(id: string, userId: string): Promise<void> {
    const entity = await this.findOne(id);
    entity.deletedAt = new Date();
    entity.deletedBy = userId;
    await this.repo.getEntityManager().flush();
    this.logger.log(`CONSTRUCTION_SUBCATEGORY_DELETED: id=${id}, by=${userId}`);
  }
}
