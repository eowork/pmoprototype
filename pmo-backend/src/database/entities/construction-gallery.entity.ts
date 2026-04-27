import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'construction_gallery' })
export class ConstructionGallery {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ columnType: 'uuid' })
  projectId!: string;

  @Property({ length: 500 })
  imageUrl!: string;

  @Property({ nullable: true, length: 255 })
  caption?: string;

  @Property({ length: 50, default: 'PROGRESS' })
  category: string = 'PROGRESS';

  @Property({ type: 'boolean', default: false })
  isFeatured: boolean = false;

  @Property({ defaultRaw: 'NOW()', columnType: 'timestamptz' })
  uploadedAt: Date = new Date();
}
