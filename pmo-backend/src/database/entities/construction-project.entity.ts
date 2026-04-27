import { Entity, Filter, PrimaryKey, Property } from '@mikro-orm/core';

@Filter({ name: 'notDeleted', cond: { deletedAt: null }, default: true })
@Entity({ tableName: 'construction_projects' })
export class ConstructionProject {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ columnType: 'bigserial', unique: true })
  infraProjectUid!: number;

  @Property({ columnType: 'uuid', unique: true })
  projectId!: string;

  @Property({ length: 50, unique: true })
  projectCode!: string;

  @Property({ length: 255 })
  title!: string;

  @Property({ nullable: true, columnType: 'text' })
  description?: string;

  @Property({ nullable: true, length: 255 })
  idealInfrastructureImage?: string;

  @Property({ nullable: true, length: 255 })
  beneficiaries?: string;

  @Property({ nullable: true, columnType: 'jsonb' })
  objectives?: any;

  @Property({ nullable: true, columnType: 'jsonb' })
  keyFeatures?: any;

  @Property({ nullable: true, length: 100 })
  originalContractDuration?: string;

  @Property({ nullable: true, length: 50 })
  contractNumber?: string;

  @Property({ nullable: true, columnType: 'uuid' })
  contractorId?: string;

  @Property({ nullable: true, columnType: 'decimal(15,2)' })
  contractAmount?: string;

  @Property({ nullable: true, columnType: 'date' })
  startDate?: Date;

  @Property({ nullable: true, columnType: 'date' })
  targetCompletionDate?: Date;

  @Property({ nullable: true, columnType: 'date' })
  actualCompletionDate?: Date;

  @Property({ nullable: true, length: 100 })
  projectDuration?: string;

  @Property({ nullable: true, length: 255 })
  projectEngineer?: string;

  @Property({ nullable: true, length: 255 })
  projectManager?: string;

  @Property({ nullable: true, length: 100 })
  buildingType?: string;

  @Property({ nullable: true, columnType: 'decimal(10,2)' })
  floorArea?: string;

  @Property({ nullable: true, type: 'integer' })
  numberOfFloors?: number;

  @Property({ columnType: 'uuid' })
  fundingSourceId!: string;

  @Property({ nullable: true, columnType: 'uuid' })
  subcategoryId?: string;

  @Property({ length: 50 })
  campus!: string;

  @Property({ length: 50 })
  status!: string;

  @Property({ nullable: true, columnType: 'decimal(9,6)' })
  latitude?: string;

  @Property({ nullable: true, columnType: 'decimal(9,6)' })
  longitude?: string;

  @Property({ columnType: 'decimal(5,2)', default: 0 })
  physicalProgress: string = '0.00';

  @Property({ columnType: 'decimal(5,2)', default: 0 })
  financialProgress: string = '0.00';

  @Property({ nullable: true, columnType: 'jsonb' })
  timelineData?: any;

  @Property({ nullable: true, columnType: 'jsonb' })
  galleryImages?: any;

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
