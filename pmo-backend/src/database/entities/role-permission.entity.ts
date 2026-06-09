import { Entity, PrimaryKey, PrimaryKeyProp, Property } from '@mikro-orm/core';

@Entity({ tableName: 'role_permissions' })
export class RolePermission {
  [PrimaryKeyProp]?: ['roleId', 'permissionId'];

  @PrimaryKey({ columnType: 'uuid' })
  roleId!: string;

  @PrimaryKey({ columnType: 'uuid' })
  permissionId!: string;

  @Property({ defaultRaw: 'NOW()', columnType: 'timestamptz' })
  createdAt: Date = new Date();

  @Property({ nullable: true, columnType: 'uuid' })
  createdBy?: string;
}
