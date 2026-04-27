import { Entity, Filter, PrimaryKey, Property } from '@mikro-orm/core';

@Filter({ name: 'notDeleted', cond: { deletedAt: null }, default: true })
@Entity({ tableName: 'gad_budget_plans' })
export class GadBudgetPlan {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ length: 255 })
  title!: string;

  @Property({ nullable: true, columnType: 'text' })
  description?: string;

  @Property({ nullable: true, length: 100 })
  category?: string;

  @Property({ nullable: true, length: 20 })
  priority?: string;

  @Property({ nullable: true, length: 50 })
  status?: string;

  @Property({ nullable: true, columnType: 'decimal(12,2)' })
  budgetAllocated?: string;

  @Property({ nullable: true, columnType: 'decimal(12,2)' })
  budgetUtilized?: string;

  @Property({ nullable: true, type: 'integer' })
  targetBeneficiaries?: number;

  @Property({ nullable: true, columnType: 'date' })
  startDate?: Date;

  @Property({ nullable: true, columnType: 'date' })
  endDate?: Date;

  @Property({ nullable: true, length: 4 })
  year?: string;

  @Property({ nullable: true, length: 255 })
  responsible?: string;

  @Property({ nullable: true, length: 50, default: 'pending' })
  dataStatus: string = 'pending';

  @Property({ nullable: true, columnType: 'uuid' })
  submittedBy?: string;

  @Property({ nullable: true, columnType: 'uuid' })
  reviewedBy?: string;

  @Property({ nullable: true, columnType: 'timestamptz' })
  reviewedAt?: Date;

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
