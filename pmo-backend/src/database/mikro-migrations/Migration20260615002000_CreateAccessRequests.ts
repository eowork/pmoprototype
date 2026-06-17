import { Migration } from '@mikro-orm/migrations';

/**
 * PHASE BBBA (BBBA-3a) — self-service access requests.
 *
 * Request → admin review → decision. APPROVE writes a `user_permission_overrides` grant
 * (lifting the default-DENY module block); DENY records the decision only.
 */
export class Migration20260615002000_CreateAccessRequests extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE IF NOT EXISTS access_requests (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL,
        requested_module varchar(50) NOT NULL,
        requested_level varchar(30) NOT NULL,
        justification text NULL,
        status varchar(20) NOT NULL DEFAULT 'PENDING',
        granted_level varchar(30) NULL,
        decision_note text NULL,
        decided_by uuid NULL,
        decided_at timestamptz NULL,
        requested_at timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT access_requests_pkey PRIMARY KEY (id)
      )
    `);
    this.addSql(
      `CREATE INDEX IF NOT EXISTS access_requests_user_id_index ON access_requests (user_id)`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS access_requests_status_index ON access_requests (status)`,
    );
  }

  async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS access_requests`);
  }
}
