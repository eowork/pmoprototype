import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from '../database/entities/user.entity';

export enum ActivityAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  SUBMIT = 'SUBMIT',
  PUBLISH = 'PUBLISH',
  REJECT = 'REJECT',
  WITHDRAW = 'WITHDRAW',
  UPLOAD = 'UPLOAD',
  REMOVE_ATTACHMENT = 'REMOVE_ATTACHMENT',
  DOWNLOAD = 'DOWNLOAD',
  BATCH_UPLOAD = 'BATCH_UPLOAD',
  REMARKS_UPDATE = 'REMARKS_UPDATE',
  TEMPLATE_UPLOAD = 'TEMPLATE_UPLOAD',
}

@Entity({ tableName: 'activity_logs' })
export class ActivityLog {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @ManyToOne(() => User, { nullable: true, fieldName: 'user_id' })
  user?: User;

  @Property({ length: 255 })
  userEmail!: string;

  @Property({ length: 255 })
  userName!: string;

  @Enum({ items: () => ActivityAction, length: 50 })
  action!: ActivityAction;

  @Property({ length: 100 })
  entityType!: string;

  @Property({ columnType: 'uuid' })
  entityId!: string;

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, unknown>;

  @Property({ defaultRaw: 'now()', columnType: 'timestamptz' })
  createdAt: Date = new Date();
}
