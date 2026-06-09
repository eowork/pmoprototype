import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'user_pillar_assignments' })
export class UserPillarAssignment {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ columnType: 'uuid' })
  userId!: string;

  @Property({ length: 50 })
  pillarType!: string;

  @Property({ nullable: true, columnType: 'uuid' })
  assignedBy?: string;

  @Property({ defaultRaw: 'NOW()', columnType: 'timestamptz' })
  assignedAt: Date = new Date();
}
