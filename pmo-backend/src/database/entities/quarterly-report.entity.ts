import { Entity, Filter, PrimaryKey, Property } from '@mikro-orm/core';

@Filter({ name: 'notDeleted', cond: { deletedAt: null } })
@Entity({ tableName: 'quarterly_reports' })
export class QuarterlyReport {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ type: 'integer' })
  fiscalYear!: number;

  @Property({ length: 10 })
  quarter!: string;

  @Property({ columnType: 'text' })
  title!: string;

  @Property({ length: 20, default: 'DRAFT' })
  publicationStatus: string = 'DRAFT';

  @Property({ nullable: true, columnType: 'uuid' })
  createdBy?: string;

  @Property({ type: 'integer', default: 0 })
  submissionCount: number = 0;

  @Property({ nullable: true, columnType: 'timestamptz' })
  submittedAt?: Date;

  @Property({ nullable: true, columnType: 'uuid' })
  submittedBy?: string;

  @Property({ nullable: true, columnType: 'timestamptz' })
  reviewedAt?: Date;

  @Property({ nullable: true, columnType: 'uuid' })
  reviewedBy?: string;

  @Property({ nullable: true, columnType: 'text' })
  reviewNotes?: string;

  @Property({ nullable: true, columnType: 'timestamptz' })
  unlockRequestedAt?: Date;

  @Property({ nullable: true, columnType: 'uuid' })
  unlockRequestedBy?: string;

  @Property({ nullable: true, columnType: 'text' })
  unlockRequestReason?: string;

  @Property({ nullable: true, columnType: 'uuid' })
  unlockedBy?: string;

  @Property({ nullable: true, columnType: 'timestamptz' })
  unlockedAt?: Date;

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
