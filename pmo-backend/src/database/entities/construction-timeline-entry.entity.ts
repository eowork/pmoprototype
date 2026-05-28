import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

/**
 * Phase JW-G: Periodic project diary entries (daily/weekly/monthly/quarterly).
 * Independent of milestones — populated admin-side, consumed by the client
 * prototype's Timeline tab.
 */
@Entity({ tableName: 'construction_timeline_entries' })
export class ConstructionTimelineEntry {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ columnType: 'uuid' })
  projectId!: string;

  @Property({ length: 20, default: 'WEEKLY' })
  entryType: string = 'WEEKLY';

  @Property({ columnType: 'date' })
  entryDate!: Date;

  @Property({ nullable: true, length: 100 })
  periodLabel?: string;

  @Property({ length: 255 })
  title!: string;

  @Property({ nullable: true, columnType: 'text' })
  description?: string;

  @Property({ nullable: true, length: 100 })
  weather?: string;

  @Property({ nullable: true, type: 'integer' })
  manpowerCount?: number;

  @Property({ nullable: true, columnType: 'text' })
  equipmentUsed?: string;

  @Property({ nullable: true, columnType: 'text' })
  workAccomplished?: string;

  @Property({ nullable: true, columnType: 'text' })
  issuesEncountered?: string;

  @Property({ type: 'integer', default: 0 })
  photosCount: number = 0;

  // LC-D: who filed this entry — enables evaluator vs constructor log filtering
  @Property({ nullable: true, length: 20 })
  reporterType?: string;

  @Property({ nullable: true, columnType: 'uuid' })
  createdBy?: string;

  @Property({ defaultRaw: 'NOW()', columnType: 'timestamptz' })
  createdAt: Date = new Date();

  @Property({
    defaultRaw: 'NOW()',
    onUpdate: () => new Date(),
    columnType: 'timestamptz',
  })
  updatedAt: Date = new Date();
}
