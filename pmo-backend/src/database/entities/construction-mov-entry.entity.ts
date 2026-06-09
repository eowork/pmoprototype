import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

/**
 * Phase KO: MOV (Means of Verification) evidence entries.
 * URL-only evidence linked to either a milestone or a timeline diary entry.
 *
 * Polymorphic relation by `relatedEntityType` + `relatedEntityId` —
 * validated at service layer (no FK at DB level).
 */
@Entity({ tableName: 'construction_mov_entries' })
export class ConstructionMovEntry {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ columnType: 'uuid' })
  projectId!: string;

  @Property({ length: 20 })
  relatedEntityType!: 'MILESTONE' | 'TIMELINE_ENTRY';

  @Property({ columnType: 'uuid' })
  relatedEntityId!: string;

  // LC-C: movLink is now optional — a MOV entry has either a URL link OR an uploaded file
  @Property({ nullable: true, columnType: 'text' })
  movLink?: string;

  @Property({ length: 255 })
  movTitle!: string;

  @Property({ nullable: true, columnType: 'text' })
  movDescription?: string;

  @Property({ length: 50, default: 'other' })
  evidenceCategory: string = 'other';

  @Property({ nullable: true, columnType: 'date' })
  entryDate?: Date;

  @Property({ nullable: true, columnType: 'uuid' })
  uploadedBy?: string;

  @Property({ length: 20, default: 'PENDING' })
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' = 'PENDING';

  @Property({ nullable: true, columnType: 'text' })
  remarks?: string;

  // LC-C: file upload fields — populated when MOV evidence is a file rather than a URL
  @Property({ nullable: true, length: 500 })
  filePath?: string;

  @Property({ nullable: true, length: 255 })
  fileName?: string;

  @Property({ nullable: true, type: 'integer' })
  fileSize?: number;

  @Property({ nullable: true, length: 100 })
  mimeType?: string;

  @Property({ defaultRaw: 'NOW()', columnType: 'timestamptz' })
  createdAt: Date = new Date();

  @Property({
    defaultRaw: 'NOW()',
    onUpdate: () => new Date(),
    columnType: 'timestamptz',
  })
  updatedAt: Date = new Date();
}
