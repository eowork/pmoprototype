import { Entity, Filter, PrimaryKey, Property } from '@mikro-orm/core';

@Filter({ name: 'notDeleted', cond: { deletedAt: null } })
@Entity({ tableName: 'operation_indicators' })
export class OperationIndicator {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ columnType: 'uuid' })
  operationId!: string;

  @Property({ nullable: true, columnType: 'uuid' })
  pillarIndicatorId?: string;

  @Property({ nullable: true, length: 500 })
  particular?: string;

  @Property({ nullable: true, columnType: 'text' })
  description?: string;

  @Property({ nullable: true, length: 100 })
  indicatorCode?: string;

  @Property({ nullable: true, length: 50 })
  uacsCode?: string;

  @Property({ nullable: true, type: 'integer' })
  fiscalYear?: number;

  @Property({ nullable: true, length: 10 })
  reportedQuarter?: string;

  @Property({ nullable: true, columnType: 'numeric' })
  targetQ1?: number;

  @Property({ nullable: true, columnType: 'numeric' })
  targetQ2?: number;

  @Property({ nullable: true, columnType: 'numeric' })
  targetQ3?: number;

  @Property({ nullable: true, columnType: 'numeric' })
  targetQ4?: number;

  @Property({ nullable: true, columnType: 'numeric' })
  accomplishmentQ1?: number;

  @Property({ nullable: true, columnType: 'numeric' })
  accomplishmentQ2?: number;

  @Property({ nullable: true, columnType: 'numeric' })
  accomplishmentQ3?: number;

  @Property({ nullable: true, columnType: 'numeric' })
  accomplishmentQ4?: number;

  @Property({ nullable: true, length: 250 })
  scoreQ1?: string;

  @Property({ nullable: true, length: 250 })
  scoreQ2?: string;

  @Property({ nullable: true, length: 250 })
  scoreQ3?: string;

  @Property({ nullable: true, length: 250 })
  scoreQ4?: string;

  @Property({ nullable: true, columnType: 'numeric' })
  overrideTotalTarget?: number;

  @Property({ nullable: true, columnType: 'numeric' })
  overrideTotalActual?: number;

  @Property({ nullable: true, columnType: 'numeric' })
  overrideRate?: number;

  @Property({ nullable: true, columnType: 'numeric' })
  overrideVariance?: number;

  @Property({ nullable: true, columnType: 'text' })
  catchUpPlan?: string;

  @Property({ nullable: true, columnType: 'text' })
  facilitatingFactors?: string;

  @Property({ nullable: true, columnType: 'text' })
  waysForward?: string;

  @Property({ nullable: true, columnType: 'text' })
  mov?: string;

  @Property({ nullable: true, columnType: 'text' })
  remarks?: string;

  @Property({ nullable: true, columnType: 'jsonb' })
  metadata?: Record<string, any>;

  @Property({ columnType: 'uuid' })
  createdBy!: string;

  @Property({ nullable: true, columnType: 'uuid' })
  updatedBy?: string;

  @Property({ nullable: true, columnType: 'uuid' })
  deletedBy?: string;

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
