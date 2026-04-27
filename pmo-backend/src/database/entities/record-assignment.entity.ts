import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'record_assignments' })
export class RecordAssignment {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ length: 50 })
  module!: string;

  @Property({ columnType: 'uuid' })
  recordId!: string;

  @Property({ columnType: 'uuid' })
  userId!: string;

  @Property({ nullable: true, defaultRaw: 'NOW()', columnType: 'timestamptz' })
  assignedAt?: Date;

  @Property({ nullable: true, columnType: 'uuid' })
  assignedBy?: string;
}
