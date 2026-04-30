import { Migration } from '@mikro-orm/migrations';

/**
 * Phase JI Baseline Migration
 *
 * This migration represents the DB state AFTER all 43 manually-applied SQL
 * migrations (001–043 in `database/migrations/`). The schema was built
 * incrementally via `psql -f` from project start through Phase JH-A.
 *
 * up() and down() are intentionally empty — the DB is already correct.
 * This entry exists solely to anchor MikroORM's migration tracking table.
 *
 * Going forward: ALL schema changes use MikroORM TypeScript migration classes.
 * NEVER add new files to `database/migrations/`.
 */
export class Migration20260430000000_Baseline extends Migration {
  async up(): Promise<void> {
    // No-op. DB schema is already at baseline state (post-migration-043).
  }

  async down(): Promise<void> {
    // No-op. Rollback of the pre-MikroORM baseline is not supported.
  }
}
