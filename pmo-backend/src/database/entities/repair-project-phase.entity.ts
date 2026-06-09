import { Entity, Filter, PrimaryKey, Property } from '@mikro-orm/core';

@Filter({ name: 'notDeleted', cond: { deletedAt: null }, default: true })
@Entity({ tableName: 'repair_project_phases' })
export class RepairProjectPhase {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ columnType: 'uuid' })
  repairProjectId!: string;

  @Property({ length: 100 })
  phaseName!: string;

  @Property({ nullable: true, columnType: 'text' })
  phaseDescription?: string;

  @Property({ nullable: true, columnType: 'decimal(5,2)' })
  targetProgress?: string;

  @Property({ nullable: true, columnType: 'decimal(5,2)' })
  actualProgress?: string;

  @Property({ nullable: true, length: 50 })
  status?: string;

  @Property({ nullable: true, columnType: 'date' })
  targetStartDate?: Date;

  @Property({ nullable: true, columnType: 'date' })
  targetEndDate?: Date;

  @Property({ nullable: true, columnType: 'date' })
  actualStartDate?: Date;

  @Property({ nullable: true, columnType: 'date' })
  actualEndDate?: Date;

  @Property({ nullable: true, columnType: 'text' })
  remarks?: string;

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
