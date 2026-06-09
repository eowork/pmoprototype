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
import { CreateSettingDto, UpdateSettingDto, QuerySettingDto } from './dto';
import { SystemSetting } from '../database/entities';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);
  private readonly ALLOWED_SORTS = [
    'createdAt',
    'updatedAt',
    'settingKey',
    'settingGroup',
    'isPublic',
    'dataType',
  ];

  constructor(
    @InjectRepository(SystemSetting)
    private readonly repo: EntityRepository<SystemSetting>,
  ) {}

  async findAll(
    query: QuerySettingDto,
    isAdmin: boolean,
  ): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      limit = 20,
      sort = 'settingGroup',
      order = 'asc',
    } = query;

    const sortKey = this.ALLOWED_SORTS.includes(sort) ? sort : 'settingGroup';
    const sortOrder = (order.toLowerCase() === 'asc' ? 'asc' : 'desc') as
      | 'asc'
      | 'desc';

    const where: FilterQuery<SystemSetting> = {};

    if (!isAdmin) {
      where.isPublic = true;
    } else if (query.is_public !== undefined) {
      where.isPublic = query.is_public;
    }

    if (query.group) {
      where.settingGroup = query.group;
    }
    if (query.key) {
      where.settingKey = { $ilike: `%${query.key}%` };
    }
    if (query.data_type) {
      where.dataType = query.data_type;
    }

    const [items, total] = await this.repo.findAndCount(where, {
      limit,
      offset: (page - 1) * limit,
      orderBy: { [sortKey]: sortOrder, settingKey: 'asc' },
    });

    return createPaginatedResponse(items, total, page, limit);
  }

  async findByKey(key: string, isAdmin: boolean): Promise<SystemSetting> {
    const where: FilterQuery<SystemSetting> = { settingKey: key };
    if (!isAdmin) {
      where.isPublic = true;
    }

    const item = await this.repo.findOne(where);
    if (!item) {
      throw new NotFoundException(`Setting with key ${key} not found`);
    }
    return item;
  }

  async findByGroup(group: string, isAdmin: boolean): Promise<SystemSetting[]> {
    const where: FilterQuery<SystemSetting> = { settingGroup: group };
    if (!isAdmin) {
      where.isPublic = true;
    }

    return this.repo.find(where, { orderBy: { settingKey: 'asc' } });
  }

  async create(dto: CreateSettingDto, userId: string): Promise<SystemSetting> {
    const existing = await this.repo.findOne({ settingKey: dto.setting_key });
    if (existing) {
      throw new ConflictException(
        `Setting key ${dto.setting_key} already exists`,
      );
    }

    const entity = this.repo.create({
      settingKey: dto.setting_key,
      settingValue: dto.setting_value,
      settingGroup: dto.setting_group,
      dataType: dto.data_type,
      isPublic: dto.is_public ?? false,
      description: dto.description,
      metadata: dto.metadata,
      createdBy: userId,
    });

    await this.repo.getEntityManager().persist(entity).flush();
    this.logger.log(`SETTING_CREATED: key=${dto.setting_key}, by=${userId}`);
    return entity;
  }

  async updateByKey(
    key: string,
    dto: UpdateSettingDto,
    userId: string,
  ): Promise<SystemSetting> {
    const entity = await this.findByKey(key, true);

    const fields = Object.keys(dto).filter(
      (k) => (dto as any)[k] !== undefined,
    );
    if (fields.length === 0) {
      return entity;
    }

    if (dto.setting_value !== undefined)
      entity.settingValue = dto.setting_value;
    if (dto.setting_group !== undefined)
      entity.settingGroup = dto.setting_group;
    if (dto.data_type !== undefined) entity.dataType = dto.data_type;
    if (dto.is_public !== undefined) entity.isPublic = dto.is_public;
    if (dto.description !== undefined) entity.description = dto.description;
    if (dto.metadata !== undefined) entity.metadata = dto.metadata;
    entity.updatedBy = userId;

    await this.repo.getEntityManager().flush();
    this.logger.log(
      `SETTING_UPDATED: key=${key}, by=${userId}, fields=[${fields.join(',')}]`,
    );
    return entity;
  }

  async removeByKey(key: string, userId: string): Promise<void> {
    const entity = await this.findByKey(key, true);
    entity.deletedAt = new Date();
    entity.deletedBy = userId;
    await this.repo.getEntityManager().flush();
    this.logger.log(`SETTING_DELETED: key=${key}, by=${userId}`);
  }
}
