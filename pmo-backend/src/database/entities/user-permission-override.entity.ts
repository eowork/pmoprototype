import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'user_permission_overrides' })
export class UserPermissionOverride {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ columnType: 'uuid' })
  userId!: string;

  @Property({ length: 50 })
  moduleKey!: string;

  @Property({ type: 'boolean', default: false })
  canAccess: boolean = false;

  @Property({ nullable: true, columnType: 'uuid' })
  createdBy?: string;

  @Property({ nullable: true, columnType: 'uuid' })
  updatedBy?: string;

  @Property({ defaultRaw: 'CURRENT_TIMESTAMP', columnType: 'timestamp' })
  createdAt: Date = new Date();

  @Property({
    defaultRaw: 'CURRENT_TIMESTAMP',
    onUpdate: () => new Date(),
    columnType: 'timestamp',
  })
  updatedAt: Date = new Date();
}
