import { Entity, Filter, PrimaryKey, Property } from '@mikro-orm/core';

@Filter({ name: 'notDeleted', cond: { deletedAt: null }, default: true })
@Entity({ tableName: 'construction_project_financials' })
export class ConstructionProjectFinancial {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ columnType: 'uuid' })
  projectId!: string;

  @Property({ type: 'integer' })
  fiscalYear!: number;

  @Property({ columnType: 'decimal(15,2)' })
  appropriation!: string;

  @Property({ columnType: 'decimal(15,2)' })
  obligation!: string;

  @Property({ columnType: 'decimal(15,2)', default: 0 })
  disbursement: string = '0';

  @Property({ nullable: true, columnType: 'jsonb' })
  metadata?: Record<string, any>;

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
