import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';

/**
 * PHASE BBBA (BBBA-3a) — self-service access requests.
 *
 * A user asks for access to a module at a requested level; an admin approves (which lifts the
 * default-DENY module block via a `user_permission_overrides` grant), edits the granted level,
 * or denies. Mirrors `PasswordResetRequest`'s request→review→complete shape.
 *
 * NOTE (R-293): `requestedLevel`/`grantedLevel` are ADVISORY — actual CRUD within a module is
 * governed by the user's existing role tier until Phase-2 per-action enforcement ships.
 */
@Entity({ tableName: 'access_requests' })
export class AccessRequest {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Index()
  @Property({ columnType: 'uuid' })
  userId!: string;

  // 'coi' | 'repairs' | 'university_operations'
  @Property({ length: 50 })
  requestedModule!: string;

  // 'Viewer' | 'Contributor' | 'Approver' | 'Manager'
  @Property({ length: 30 })
  requestedLevel!: string;

  @Property({ nullable: true, columnType: 'text' })
  justification?: string;

  @Index()
  @Property({ length: 20, default: 'PENDING' })
  status: string = 'PENDING';

  @Property({ nullable: true, length: 30 })
  grantedLevel?: string;

  @Property({ nullable: true, columnType: 'text' })
  decisionNote?: string;

  @Property({ nullable: true, columnType: 'uuid' })
  decidedBy?: string;

  @Property({ nullable: true, columnType: 'timestamptz' })
  decidedAt?: Date;

  @Property({ defaultRaw: 'NOW()', columnType: 'timestamptz' })
  requestedAt: Date = new Date();
}
