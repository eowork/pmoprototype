import { Entity, Filter, PrimaryKey, Property } from '@mikro-orm/core';

@Filter({ name: 'notDeleted', cond: { deletedAt: null }, default: true })
@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ length: 255, unique: true })
  username!: string;

  @Property({ nullable: true, length: 255, unique: true })
  email?: string;

  @Property({ nullable: true, columnType: 'text' })
  passwordHash?: string;

  @Property({ nullable: true, columnType: 'text' })
  firstName?: string;

  @Property({ nullable: true, columnType: 'text' })
  lastName?: string;

  @Property({ nullable: true, columnType: 'text' })
  middleName?: string;

  @Property({ nullable: true, length: 255 })
  displayName?: string;

  @Property({ nullable: true, columnType: 'text' })
  avatarUrl?: string;

  @Property({ nullable: true, columnType: 'text' })
  campus?: string;

  @Property({ nullable: true, length: 50, default: 'ACTIVE' })
  status?: string;

  @Property({ type: 'boolean', default: true })
  isActive: boolean = true;

  @Property({ nullable: true, type: 'integer' })
  rankLevel?: number;

  @Property({ nullable: true, length: 255, unique: true })
  googleId?: string;

  @Property({ nullable: true, type: 'integer', default: 0 })
  failedLoginAttempts?: number;

  @Property({ nullable: true, columnType: 'timestamptz' })
  accountLockedUntil?: Date;

  @Property({ nullable: true, columnType: 'timestamptz' })
  lastLoginAt?: Date;

  @Property({ nullable: true, columnType: 'timestamptz' })
  lastPasswordChangeAt?: Date;

  @Property({ nullable: true, length: 20 })
  phone?: string;

  @Property({ nullable: true, columnType: 'jsonb' })
  metadata?: Record<string, any>;

  @Property({ nullable: true, columnType: 'uuid' })
  createdBy?: string;

  @Property({ nullable: true, columnType: 'uuid' })
  updatedBy?: string;

  @Property({ nullable: true, columnType: 'uuid' })
  deletedBy?: string;

  @Property({ defaultRaw: 'NOW()', columnType: 'timestamptz' })
  createdAt: Date = new Date();

  @Property({
    defaultRaw: 'NOW()',
    onUpdate: () => new Date(),
    columnType: 'timestamptz',
  })
  updatedAt: Date = new Date();

  @Property({ nullable: true, columnType: 'timestamptz' })
  deletedAt?: Date;
}
