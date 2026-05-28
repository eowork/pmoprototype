import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'project_contractor_assignments' })
export class ProjectContractorAssignment {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ columnType: 'uuid' })
  projectId!: string;

  @Property({ columnType: 'uuid' })
  userId!: string;

  @Property({ nullable: true, columnType: 'uuid' })
  inviteTokenId?: string;

  @Property({ nullable: true, length: 100 })
  role?: string;

  @Property({ columnType: 'jsonb', nullable: true })
  permissions?: Record<string, any>;

  @Property({ nullable: true, columnType: 'uuid' })
  assignedBy?: string;

  @Property({ nullable: true, columnType: 'timestamptz' })
  removedAt?: Date;

  @Property({ defaultRaw: 'NOW()', columnType: 'timestamptz' })
  assignedAt: Date = new Date();
}
