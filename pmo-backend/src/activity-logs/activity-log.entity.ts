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
  // PHASE BBBC (Track 7): authentication, identity, and permission events.
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  FAILED_LOGIN = 'FAILED_LOGIN',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  ACCESS_REQUEST = 'ACCESS_REQUEST',
  ACCESS_APPROVE = 'ACCESS_APPROVE',
  ACCESS_REJECT = 'ACCESS_REJECT',
  ROLE_ASSIGN = 'ROLE_ASSIGN',
  // PHASE BBBG (Track 4): audit completeness — lifecycle, identity, and permission events.
  FIRST_LOGIN = 'FIRST_LOGIN',
  PROFILE_COMPLETED = 'PROFILE_COMPLETED',
  RANK_CHANGED = 'RANK_CHANGED',
  MODULE_ACCESS_CHANGED = 'MODULE_ACCESS_CHANGED',
  ACCESS_REVOKED = 'ACCESS_REVOKED',
  ACCOUNT_ENABLED = 'ACCOUNT_ENABLED',
  ACCOUNT_DISABLED = 'ACCOUNT_DISABLED',
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  // PHASE BBCH (Track 3, R-374/R-376): access-request lifecycle audit completeness.
  ACCESS_CANCELLED = 'ACCESS_CANCELLED',
  ACCESS_REOPENED = 'ACCESS_REOPENED',
  ACCESS_EXPIRED = 'ACCESS_EXPIRED',
  // PHASE BBCH (Track 5, R-375): password-reset lifecycle audit completeness.
  PASSWORD_RESET_COMPLETED = 'PASSWORD_RESET_COMPLETED',
  PASSWORD_RESET_DENIED = 'PASSWORD_RESET_DENIED',
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
