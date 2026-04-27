import { Entity, Filter, PrimaryKey, Property } from '@mikro-orm/core';

@Filter({ name: 'notDeleted', cond: { deletedAt: null } })
@Entity({ tableName: 'operation_organizational_info' })
export class OperationOrganizationalInfo {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ columnType: 'uuid', unique: true })
  operationId!: string;

  @Property({ nullable: true, columnType: 'text' })
  department?: string;

  @Property({ nullable: true, columnType: 'text' })
  agencyEntity?: string;

  @Property({ nullable: true, columnType: 'text' })
  operatingUnit?: string;

  @Property({ nullable: true, length: 100 })
  organizationCode?: string;

  @Property({ defaultRaw: 'NOW()', columnType: 'timestamptz' })
  createdAt: Date = new Date();

  @Property({
    defaultRaw: 'NOW()',
    onUpdate: () => new Date(),
    columnType: 'timestamptz',
  })
  updatedAt: Date = new Date();

  @Property({ nullable: true, columnType: 'timestamptz' })
  deletedAt?: Date;
}
