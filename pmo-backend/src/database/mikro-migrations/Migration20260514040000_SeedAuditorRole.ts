import { Migration } from '@mikro-orm/migrations';

/**
 * Phase KS-2: Seed the Auditor role.
 *
 * Ports `database/migrations/045_seed_auditor_role.sql` (Phase JT-E-1)
 * into the MikroORM migration system. Roles are DB-stored rows — no backend
 * enum exists. The ON CONFLICT DO NOTHING guard makes this idempotent.
 *
 * Auditor: read-only access across all modules + access to activity_logs.
 * Rank 90 — between SuperAdmin (100) and standard staff roles.
 */
export class Migration20260514040000_SeedAuditorRole extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      INSERT INTO roles (name, description, created_at, updated_at)
      VALUES (
        'Auditor',
        'Read-only access across all modules plus access to activity logs.',
        NOW(),
        NOW()
      )
      ON CONFLICT (name) DO NOTHING;
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`DELETE FROM roles WHERE name = 'Auditor';`);
  }
}
