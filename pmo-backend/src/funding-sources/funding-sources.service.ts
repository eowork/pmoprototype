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
  CreateFundingSourceDto,
  UpdateFundingSourceDto,
  QueryFundingSourceDto,
} from './dto';
import { FundingSource } from '../database/entities';

@Injectable()
export class FundingSourcesService {
  private readonly logger = new Logger(FundingSourcesService.name);
  private readonly ALLOWED_SORTS = ['createdAt', 'updatedAt', 'name'];

  constructor(
    @InjectRepository(FundingSource)
    private readonly fundingSourceRepo: EntityRepository<FundingSource>,
  ) {}

  async findAll(query: QueryFundingSourceDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = query;

    const sortKey = this.ALLOWED_SORTS.includes(sort) ? sort : 'createdAt';
    const sortOrder = (order.toLowerCase() === 'asc' ? 'asc' : 'desc') as
      | 'asc'
      | 'desc';

    const where: FilterQuery<FundingSource> = {};
    if (query.name) {
      where.name = { $like: `%${query.name}%` };
    }

    const [items, total] = await this.fundingSourceRepo.findAndCount(where, {
      limit,
      offset: (page - 1) * limit,
      orderBy: { [sortKey]: sortOrder },
    });

    return createPaginatedResponse(items, total, page, limit);
  }

  async findOne(id: string): Promise<FundingSource> {
    const item = await this.fundingSourceRepo.findOne({ id });
    if (!item) {
      throw new NotFoundException(`Funding source with ID ${id} not found`);
    }
    return item;
  }

  async create(
    dto: CreateFundingSourceDto,
    userId: string,
  ): Promise<FundingSource> {
    const existing = await this.fundingSourceRepo.findOne({ name: dto.name });
    if (existing) {
      throw new ConflictException(
        `Funding source name ${dto.name} already exists`,
      );
    }

    const entity = this.fundingSourceRepo.create({
      name: dto.name,
      description: dto.description,
      createdBy: userId,
    });

    await this.fundingSourceRepo.getEntityManager().persist(entity).flush();
    this.logger.log(`FUNDING_SOURCE_CREATED: id=${entity.id}, by=${userId}`);
    return entity;
  }

  async update(
    id: string,
    dto: UpdateFundingSourceDto,
    userId: string,
  ): Promise<FundingSource> {
    const entity = await this.findOne(id);

    if (dto.name && dto.name !== entity.name) {
      const existing = await this.fundingSourceRepo.findOne({
        name: dto.name,
        id: { $ne: id },
      });
      if (existing) {
        throw new ConflictException(
          `Funding source name ${dto.name} already exists`,
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
    await this.fundingSourceRepo.getEntityManager().flush();
    this.logger.log(
      `FUNDING_SOURCE_UPDATED: id=${id}, by=${userId}, fields=[${fields.join(',')}]`,
    );
    return entity;
  }

  async remove(id: string, userId: string): Promise<void> {
    const entity = await this.findOne(id);
    entity.deletedAt = new Date();
    entity.deletedBy = userId;
    await this.fundingSourceRepo.getEntityManager().flush();
    this.logger.log(`FUNDING_SOURCE_DELETED: id=${id}, by=${userId}`);
  }
}
