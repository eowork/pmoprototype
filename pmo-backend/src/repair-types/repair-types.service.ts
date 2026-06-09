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
  CreateRepairTypeDto,
  UpdateRepairTypeDto,
  QueryRepairTypeDto,
} from './dto';
import { RepairType } from '../database/entities';

@Injectable()
export class RepairTypesService {
  private readonly logger = new Logger(RepairTypesService.name);
  private readonly ALLOWED_SORTS = ['createdAt', 'updatedAt', 'name'];

  constructor(
    @InjectRepository(RepairType)
    private readonly repairTypeRepo: EntityRepository<RepairType>,
  ) {}

  async findAll(query: QueryRepairTypeDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = query;

    const sortKey = this.ALLOWED_SORTS.includes(sort) ? sort : 'createdAt';
    const sortOrder = (order.toLowerCase() === 'asc' ? 'asc' : 'desc') as
      | 'asc'
      | 'desc';

    const where: FilterQuery<RepairType> = {};
    if (query.name) {
      where.name = { $like: `%${query.name}%` };
    }

    const [items, total] = await this.repairTypeRepo.findAndCount(where, {
      limit,
      offset: (page - 1) * limit,
      orderBy: { [sortKey]: sortOrder },
    });

    return createPaginatedResponse(items, total, page, limit);
  }

  async findOne(id: string): Promise<RepairType> {
    const item = await this.repairTypeRepo.findOne({ id });
    if (!item) {
      throw new NotFoundException(`Repair type with ID ${id} not found`);
    }
    return item;
  }

  async create(dto: CreateRepairTypeDto, userId: string): Promise<RepairType> {
    const existing = await this.repairTypeRepo.findOne({ name: dto.name });
    if (existing) {
      throw new ConflictException(
        `Repair type name ${dto.name} already exists`,
      );
    }

    const entity = this.repairTypeRepo.create({
      name: dto.name,
      description: dto.description,
      metadata: dto.metadata,
      createdBy: userId,
    });

    await this.repairTypeRepo.getEntityManager().persist(entity).flush();
    this.logger.log(`REPAIR_TYPE_CREATED: id=${entity.id}, by=${userId}`);
    return entity;
  }

  async update(
    id: string,
    dto: UpdateRepairTypeDto,
    userId: string,
  ): Promise<RepairType> {
    const entity = await this.findOne(id);

    if (dto.name && dto.name !== entity.name) {
      const existing = await this.repairTypeRepo.findOne({
        name: dto.name,
        id: { $ne: id },
      });
      if (existing) {
        throw new ConflictException(
          `Repair type name ${dto.name} already exists`,
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
    await this.repairTypeRepo.getEntityManager().flush();
    this.logger.log(
      `REPAIR_TYPE_UPDATED: id=${id}, by=${userId}, fields=[${fields.join(',')}]`,
    );
    return entity;
  }

  async remove(id: string, userId: string): Promise<void> {
    const entity = await this.findOne(id);
    entity.deletedAt = new Date();
    entity.deletedBy = userId;
    await this.repairTypeRepo.getEntityManager().flush();
    this.logger.log(`REPAIR_TYPE_DELETED: id=${id}, by=${userId}`);
  }
}
