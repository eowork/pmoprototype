import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { ActivityAction, ActivityLog } from './activity-log.entity';
import { User } from '../database/entities/user.entity';
import { JwtPayload } from '../common/interfaces';

export interface ActivityLogFilter {
  entityType?: string;
  entityId?: string;
  userId?: string;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);

  constructor(
    @InjectRepository(ActivityLog)
    private readonly repo: EntityRepository<ActivityLog>,
    private readonly em: EntityManager,
  ) {}

  // Fire-and-forget per JT-D2 — never throws to caller.
  async logAction(
    user: JwtPayload,
    action: ActivityAction,
    entityType: string,
    entityId: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    try {
      const userRef = this.em.getReference(User, user.sub);
      const log = this.repo.create({
        user: userRef,
        userEmail: user.email,
        userName: user.email,
        action,
        entityType,
        entityId,
        metadata,
        createdAt: new Date(),
      });
      await this.em.persistAndFlush(log);
    } catch (err) {
      this.logger.warn(
        `[ActivityLog] Failed to record ${action} on ${entityType}:${entityId} — ${(err as Error).message}`,
      );
    }
  }

  async findLogs(filter: ActivityLogFilter): Promise<{ data: ActivityLog[]; total: number; page: number; pageSize: number }> {
    const page = filter.page && filter.page > 0 ? filter.page : 1;
    const pageSize = filter.pageSize && filter.pageSize > 0 ? Math.min(filter.pageSize, 200) : 50;
    const where: Record<string, unknown> = {};
    if (filter.entityType) where.entityType = filter.entityType;
    if (filter.entityId) where.entityId = filter.entityId;
    if (filter.userId) where.user = filter.userId;

    const [data, total] = await this.repo.findAndCount(where, {
      orderBy: { createdAt: 'DESC' },
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    return { data, total, page, pageSize };
  }
}
