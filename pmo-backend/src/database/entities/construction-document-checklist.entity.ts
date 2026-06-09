import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

/**
 * Phase KB-E: Per-project document checklist instances.
 * Lazy-initialized — rows are created on first GET checklist call,
 * pulling from `construction_document_types` reference.
 *
 * `linked_document_id` references `documents.id` (the actual uploaded file
 * in the existing flat documents table). Decoupled lifecycle: a checklist
 * item exists for compliance tracking even before any file is uploaded.
 */
@Entity({ tableName: 'construction_document_checklist' })
export class ConstructionDocumentChecklist {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ columnType: 'uuid' })
  projectId!: string;

  @Property({ columnType: 'uuid' })
  documentTypeId!: string;

  @Property({ length: 30, default: 'NOT_SUBMITTED' })
  submissionStatus: string = 'NOT_SUBMITTED';

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

  @Property({ type: 'integer', default: 0 })
  currentVersion: number = 0;

  @Property({ nullable: true, columnType: 'date' })
  expiryDate?: Date;

  @Property({ nullable: true, columnType: 'uuid' })
  linkedDocumentId?: string;

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
}
