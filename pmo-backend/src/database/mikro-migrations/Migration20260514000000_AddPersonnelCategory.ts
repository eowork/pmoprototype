import { Migration } from '@mikro-orm/migrations';

/**
 * Phase KD-D: Add personnel_category to record_assignments.
 * Enables grouping of assigned personnel by governance role
 * (IMPLEMENTING / MONITORING / UNIVERSITY_OFFICIAL / OVERSIGHT).
 * Nullable — existing rows fall back to "Assigned Personnel" group.
 */
export class Migration20260514000000_AddPersonnelCategory extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE record_assignments
        ADD COLUMN IF NOT EXISTS personnel_category VARCHAR(50);
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`
      ALTER TABLE record_assignments
        DROP COLUMN IF EXISTS personnel_category;
    `);
  }
}
