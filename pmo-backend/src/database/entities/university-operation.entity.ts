import { Entity, Filter, PrimaryKey, Property } from '@mikro-orm/core';

@Filter({ name: 'notDeleted', cond: { deletedAt: null } })
@Entity({ tableName: 'university_operations' })
export class UniversityOperation {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ length: 50 })
  operationType!: string;

  @Property({ columnType: 'text' })
  title!: string;

  @Property({ nullable: true, columnType: 'text' })
  description?: string;

  @Property({ nullable: true, length: 50, unique: true })
  code?: string;

  @Property({ nullable: true, columnType: 'date' })
  startDate?: Date;

  @Property({ nullable: true, columnType: 'date' })
  endDate?: Date;

  @Property({ nullable: true, length: 20 })
  status?: string;

  @Property({ nullable: true, columnType: 'numeric' })
  budget?: number;

  @Property({ length: 100 })
  campus!: string;

  @Property({ nullable: true, columnType: 'uuid' })
  coordinatorId?: string;

  @Property({ nullable: true, columnType: 'jsonb' })
  metadata?: Record<string, any>;

  @Property({ columnType: 'uuid' })
  createdBy!: string;

  @Property({ length: 20, default: 'DRAFT' })
  publicationStatus: string = 'DRAFT';

  @Property({ nullable: true, columnType: 'uuid' })
  submittedBy?: string;

  @Property({ nullable: true, columnType: 'timestamptz' })
  submittedAt?: Date;

  @Property({ nullable: true, columnType: 'uuid' })
  reviewedBy?: string;

  @Property({ nullable: true, columnType: 'timestamptz' })
  reviewedAt?: Date;

  @Property({ nullable: true, columnType: 'text' })
  reviewNotes?: string;

  @Property({ nullable: true, columnType: 'uuid' })
  assignedTo?: string;

  @Property({ nullable: true, type: 'integer' })
  fiscalYear?: number;

  @Property({ nullable: true, length: 50 })
  statusQ1?: string;

  @Property({ nullable: true, length: 50 })
  statusQ2?: string;

  @Property({ nullable: true, length: 50 })
  statusQ3?: string;

  @Property({ nullable: true, length: 50 })
  statusQ4?: string;

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
