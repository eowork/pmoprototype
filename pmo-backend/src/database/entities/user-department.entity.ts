import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'user_departments' })
export class UserDepartment {
  @PrimaryKey({ columnType: 'uuid' })
  userId!: string;

  @PrimaryKey({ columnType: 'uuid' })
  departmentId!: string;

  @Property({ type: 'boolean', default: false })
  isPrimary: boolean = false;

  @Property({ defaultRaw: 'NOW()', columnType: 'timestamptz' })
  createdAt: Date = new Date();

  @Property({ nullable: true, columnType: 'uuid' })
  createdBy?: string;
}
