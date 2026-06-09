import { Migration } from '@mikro-orm/migrations';

/**
 * Phase KS-1: Create activity_logs table.
 *
 * Ports `database/migrations/044_create_activity_logs.sql` (Phase JT-D-4)
 * into the MikroORM migration system. The raw SQL file was never applied
 * against the live database because the MikroORM baseline (Migration20260430000000)
 * only anchored migrations 001–043. All uses of IF NOT EXISTS ensure idempotency.
 *
 * Corresponds to: ActivityLog entity in src/activity-logs/activity-log.entity.ts
 */
export class Migration20260514030000_CreateActivityLogs extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID         NULL REFERENCES users(id) ON DELETE SET NULL,
        user_email  VARCHAR(255) NOT NULL,
        user_name   VARCHAR(255) NOT NULL,
        action      VARCHAR(50)  NOT NULL,
        entity_type VARCHAR(100) NOT NULL,
        entity_id   UUID         NOT NULL,
        metadata    JSONB,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
      );
    `);

    this.addSql(
      `CREATE INDEX IF NOT EXISTS idx_activity_logs_entity
         ON activity_logs (entity_type, entity_id);`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS idx_activity_logs_user
         ON activity_logs (user_id);`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS idx_activity_logs_created
         ON activity_logs (created_at DESC);`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`DROP INDEX IF EXISTS idx_activity_logs_created;`);
    this.addSql(`DROP INDEX IF EXISTS idx_activity_logs_user;`);
    this.addSql(`DROP INDEX IF EXISTS idx_activity_logs_entity;`);
    this.addSql(`DROP TABLE IF EXISTS activity_logs;`);
  }
}
