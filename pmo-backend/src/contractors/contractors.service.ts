import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import type { FilterQuery } from '@mikro-orm/core';
import { createPaginatedResponse, PaginatedResponse } from '../common/dto';
import {
  CreateContractorDto,
  UpdateContractorDto,
  QueryContractorDto,
} from './dto';
import { Contractor } from '../database/entities';

@Injectable()
export class ContractorsService {
  private readonly logger = new Logger(ContractorsService.name);
  private readonly ALLOWED_SORTS = ['createdAt', 'updatedAt', 'name', 'status'];

  constructor(
    @InjectRepository(Contractor)
    private readonly repo: EntityRepository<Contractor>,
  ) {}

  async findAll(query: QueryContractorDto): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = query;

    const sortKey = this.ALLOWED_SORTS.includes(sort) ? sort : 'createdAt';
    const sortOrder = (order.toLowerCase() === 'asc' ? 'asc' : 'desc') as
      | 'asc'
      | 'desc';

    const where: FilterQuery<Contractor> = {};
    if (query.status) {
      where.status = query.status;
    }
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

  async findOne(id: string): Promise<Contractor> {
    const item = await this.repo.findOne({ id });
    if (!item) {
      throw new NotFoundException(`Contractor with ID ${id} not found`);
    }
    return item;
  }

  async create(dto: CreateContractorDto, userId: string): Promise<Contractor> {
    const entity = this.repo.create({
      name: dto.name,
      contactPerson: dto.contact_person,
      email: dto.email,
      phone: dto.phone,
      address: dto.address,
      tinNumber: dto.tin_number,
      registrationNumber: dto.registration_number,
      validityDate: dto.validity_date ? new Date(dto.validity_date) : undefined,
      status: dto.status,
      metadata: dto.metadata,
      createdBy: userId,
    });

    await this.repo.getEntityManager().persist(entity).flush();
    this.logger.log(`CONTRACTOR_CREATED: id=${entity.id}, by=${userId}`);
    return entity;
  }

  async update(
    id: string,
    dto: UpdateContractorDto,
    userId: string,
  ): Promise<Contractor> {
    const entity = await this.findOne(id);

    const fields = Object.keys(dto).filter(
      (k) => (dto as any)[k] !== undefined,
    );
    if (fields.length === 0) {
      return entity;
    }

    if (dto.name !== undefined) entity.name = dto.name;
    if (dto.contact_person !== undefined)
      entity.contactPerson = dto.contact_person;
    if (dto.email !== undefined) entity.email = dto.email;
    if (dto.phone !== undefined) entity.phone = dto.phone;
    if (dto.address !== undefined) entity.address = dto.address;
    if (dto.tin_number !== undefined) entity.tinNumber = dto.tin_number;
    if (dto.registration_number !== undefined)
      entity.registrationNumber = dto.registration_number;
    if (dto.validity_date !== undefined)
      entity.validityDate = dto.validity_date
        ? new Date(dto.validity_date)
        : undefined;
    if (dto.status !== undefined) entity.status = dto.status;
    if (dto.metadata !== undefined) entity.metadata = dto.metadata;
    entity.updatedBy = userId;

    await this.repo.getEntityManager().flush();
    this.logger.log(
      `CONTRACTOR_UPDATED: id=${id}, by=${userId}, fields=[${fields.join(',')}]`,
    );
    return entity;
  }

  async remove(id: string, userId: string): Promise<void> {
    const entity = await this.findOne(id);
    entity.deletedAt = new Date();
    entity.deletedBy = userId;
    await this.repo.getEntityManager().flush();
    this.logger.log(`CONTRACTOR_DELETED: id=${id}, by=${userId}`);
  }

  async updateStatus(
    id: string,
    status: string,
    userId: string,
  ): Promise<Contractor> {
    const entity = await this.findOne(id);
    entity.status = status;
    entity.updatedBy = userId;
    await this.repo.getEntityManager().flush();
    this.logger.log(
      `CONTRACTOR_STATUS_UPDATED: id=${id}, status=${status}, by=${userId}`,
    );
    return entity;
  }
}
