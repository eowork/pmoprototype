import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'construction_document_submissions' })
export class ConstructionDocumentSubmission {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ type: 'uuid', columnType: 'uuid' })
  checklistItemId!: string;

  @Property({ type: 'uuid', columnType: 'uuid' })
  projectId!: string;

  @Property({ type: 'uuid', columnType: 'uuid' })
  documentId!: string;

  @Property({ type: 'integer' })
  version!: number;

  @Property({ type: 'uuid', columnType: 'uuid' })
  submittedBy!: string;

  @Property({ defaultRaw: 'NOW()', columnType: 'timestamptz' })
  submittedAt: Date = new Date();

  @Property({ nullable: true, columnType: 'text' })
  submissionNotes?: string;

  @Property({ defaultRaw: 'NOW()', columnType: 'timestamptz' })
  createdAt: Date = new Date();
}
