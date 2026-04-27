import { Entity, Filter, PrimaryKey, Property } from '@mikro-orm/core';

@Filter({ name: 'notDeleted', cond: { deletedAt: null }, default: true })
@Entity({ tableName: 'system_settings' })
export class SystemSetting {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ length: 100 })
  settingKey!: string;

  @Property({ nullable: true, columnType: 'text' })
  settingValue?: string;

  @Property({ length: 50 })
  settingGroup!: string;

  @Property({ length: 50 })
  dataType!: string;

  @Property({ default: false })
  isPublic: boolean = false;

  @Property({ nullable: true, columnType: 'text' })
  description?: string;

  @Property({ nullable: true, columnType: 'jsonb' })
  metadata?: Record<string, unknown>;

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
