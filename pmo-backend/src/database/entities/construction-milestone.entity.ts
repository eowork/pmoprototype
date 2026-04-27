import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'construction_milestones' })
export class ConstructionMilestone {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ columnType: 'uuid' })
  projectId!: string;

  @Property({ length: 255 })
  title!: string;

  @Property({ nullable: true, columnType: 'text' })
  description?: string;

  @Property({ nullable: true, columnType: 'date' })
  targetDate?: Date;

  @Property({ nullable: true, columnType: 'date' })
  actualDate?: Date;

  @Property({ length: 50, default: 'PENDING' })
  status: string = 'PENDING';

  @Property({ nullable: true, columnType: 'text' })
  remarks?: string;

  @Property({ defaultRaw: 'NOW()', columnType: 'timestamptz' })
  createdAt: Date = new Date();
}
