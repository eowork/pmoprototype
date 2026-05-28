import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'construction_diary_entries' })
export class ConstructionDiaryEntry {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ columnType: 'uuid' })
  projectId!: string;

  @Property({ columnType: 'date' })
  entryDate!: string;

  @Property({ nullable: true, length: 255 })
  title?: string;

  @Property({ columnType: 'text' })
  content!: string;

  @Property({ nullable: true, columnType: 'uuid' })
  authorId?: string;

  @Property({ defaultRaw: 'NOW()', columnType: 'timestamptz' })
  createdAt: Date = new Date();

  @Property({
    defaultRaw: 'NOW()',
    onUpdate: () => new Date(),
    columnType: 'timestamptz',
  })
  updatedAt: Date = new Date();
}
