import { Entity, PrimaryKey, PrimaryKeyProp, Property } from '@mikro-orm/core';

@Entity({ tableName: 'user_roles' })
export class UserRole {
  [PrimaryKeyProp]?: ['userId', 'roleId'];

  @PrimaryKey({ columnType: 'uuid' })
  userId!: string;

  @PrimaryKey({ columnType: 'uuid' })
  roleId!: string;

  @Property({ type: 'boolean', default: false })
  isSuperadmin: boolean = false;

  @Property({ nullable: true, columnType: 'uuid' })
  assignedBy?: string;

  @Property({ defaultRaw: 'NOW()', columnType: 'timestamptz' })
  assignedAt: Date = new Date();

  @Property({ defaultRaw: 'NOW()', columnType: 'timestamptz' })
  createdAt: Date = new Date();

  @Property({ nullable: true, columnType: 'uuid' })
  createdBy?: string;
}
