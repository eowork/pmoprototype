import { Entity, Filter, PrimaryKey, Property } from '@mikro-orm/core';

@Filter({ name: 'notDeleted', cond: { deletedAt: null }, default: true })
@Entity({ tableName: 'departments' })
export class Department {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ length: 255 })
  name!: string;

  @Property({ nullable: true, length: 50, unique: true })
  code?: string;

  @Property({ nullable: true, columnType: 'text' })
  description?: string;

  @Property({ nullable: true, columnType: 'uuid' })
  parentId?: string;

  @Property({ nullable: true, columnType: 'uuid' })
  headId?: string;

  @Property({ nullable: true, length: 255 })
  email?: string;

  @Property({ nullable: true, length: 20 })
  phone?: string;

  @Property({ length: 50, default: 'ACTIVE' })
  status: string = 'ACTIVE';

  @Property({ nullable: true, columnType: 'jsonb' })
  metadata?: Record<string, any>;

  @Property({ nullable: true, columnType: 'uuid' })
  createdBy?: string;

  @Property({ nullable: true, columnType: 'uuid' })
  updatedBy?: string;

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

  @Property({ nullable: true, columnType: 'uuid' })
  deletedBy?: string;
}
