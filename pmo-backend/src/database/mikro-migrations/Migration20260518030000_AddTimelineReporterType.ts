import { Migration } from '@mikro-orm/migrations';

/**
 * Phase LC-D: Add reporter_type to construction_timeline_entries.
 *
 * Distinguishes who filed the entry:
 *   CONSTRUCTOR | EVALUATOR | INSPECTOR | ADMIN
 *
 * Nullable — no backfill needed; existing entries default to NULL.
 */
export class Migration20260518030000_AddTimelineReporterType extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE construction_timeline_entries
        ADD COLUMN IF NOT EXISTS reporter_type VARCHAR(20);
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`
      ALTER TABLE construction_timeline_entries
        DROP COLUMN IF EXISTS reporter_type;
    `);
  }
}
