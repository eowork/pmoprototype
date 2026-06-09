import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'contractor_invite_tokens' })
export class ContractorInviteToken {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ columnType: 'uuid' })
  projectId!: string;

  @Property({ length: 64, unique: true })
  token!: string;

  @Property({ nullable: true, length: 255 })
  targetEmail?: string;

  @Property({ columnType: 'uuid' })
  createdBy!: string;

  @Property({ columnType: 'timestamptz' })
  expiresAt!: Date;

  @Property({ nullable: true, columnType: 'timestamptz' })
  acceptedAt?: Date;

  @Property({ nullable: true, columnType: 'uuid' })
  acceptedBy?: string;

  @Property({ length: 20, default: 'PENDING' })
  status: string = 'PENDING';

  @Property({ defaultRaw: 'NOW()', columnType: 'timestamptz' })
  createdAt: Date = new Date();
}
