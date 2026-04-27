import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'password_reset_requests' })
export class PasswordResetRequest {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ columnType: 'text' })
  identifier!: string;

  @Property({ length: 20, default: 'PENDING' })
  status: string = 'PENDING';

  @Property({ nullable: true, columnType: 'text' })
  notes?: string;

  @Property({ defaultRaw: 'NOW()', columnType: 'timestamptz' })
  requestedAt: Date = new Date();

  @Property({ nullable: true, columnType: 'uuid' })
  completedBy?: string;

  @Property({ nullable: true, columnType: 'timestamptz' })
  completedAt?: Date;
}
