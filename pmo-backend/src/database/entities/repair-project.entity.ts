import { Entity, Filter, PrimaryKey, Property } from '@mikro-orm/core';

@Filter({ name: 'notDeleted', cond: { deletedAt: null }, default: true })
@Entity({ tableName: 'repair_projects' })
export class RepairProject {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ columnType: 'uuid', unique: true })
  projectId!: string;

  @Property({ length: 50, unique: true })
  projectCode!: string;

  @Property({ length: 255 })
  title!: string;

  @Property({ nullable: true, columnType: 'text' })
  description?: string;

  @Property({ length: 255 })
  buildingName!: string;

  @Property({ nullable: true, length: 20 })
  floorNumber?: string;

  @Property({ nullable: true, length: 20 })
  roomNumber?: string;

  @Property({ nullable: true, length: 255 })
  specificLocation?: string;

  @Property({ columnType: 'uuid' })
  repairTypeId!: string;

  @Property({ length: 50, default: 'LOW' })
  urgencyLevel: string = 'LOW';

  @Property({ type: 'boolean', default: false })
  isEmergency: boolean = false;

  @Property({ length: 50 })
  campus!: string;

  @Property({ nullable: true, length: 255 })
  reportedBy?: string;

  @Property({ nullable: true, defaultRaw: 'NOW()', columnType: 'timestamptz' })
  reportedDate?: Date;

  @Property({ nullable: true, columnType: 'date' })
  inspectionDate?: Date;

  @Property({ nullable: true, columnType: 'uuid' })
  inspectorId?: string;

  @Property({ nullable: true, columnType: 'text' })
  inspectionFindings?: string;

  @Property({ length: 50 })
  status!: string;

  @Property({ nullable: true, columnType: 'date' })
  startDate?: Date;

  @Property({ nullable: true, columnType: 'date' })
  endDate?: Date;

  @Property({ nullable: true, columnType: 'decimal(15,2)' })
  budget?: string;

  @Property({ nullable: true, columnType: 'decimal(15,2)' })
  actualCost?: string;

  @Property({ nullable: true, columnType: 'uuid' })
  projectManagerId?: string;

  @Property({ nullable: true, columnType: 'uuid' })
  contractorId?: string;

  @Property({ nullable: true, columnType: 'date' })
  completionDate?: Date;

  @Property({ nullable: true, columnType: 'uuid' })
  facilityId?: string;

  @Property({ nullable: true, length: 255 })
  assignedTechnician?: string;

  @Property({ columnType: 'decimal(5,2)', default: 0 })
  physicalProgress: string = '0.00';

  @Property({ columnType: 'decimal(5,2)', default: 0 })
  financialProgress: string = '0.00';

  @Property({ nullable: true, length: 50, default: 'PUBLISHED' })
  publicationStatus?: string;

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

  @Property({ columnType: 'uuid' })
  createdBy!: string;

  @Property({ nullable: true, columnType: 'uuid' })
  updatedBy?: string;

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
