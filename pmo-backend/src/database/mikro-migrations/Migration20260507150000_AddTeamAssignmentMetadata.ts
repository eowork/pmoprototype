import { Migration } from '@mikro-orm/migrations';

/**
 * Phase JW-E: Add per-assignment metadata to record_assignments.
 *
 * Client prototype renders per-member role (emerald badge), department, and
 * phone in the team section. The join table only tracked
 * (module, recordId, userId) — no admin capture surface existed for these
 * fields. This migration is purely additive (all nullable VARCHAR).
 *
 * Cross-module: `record_assignments` is shared by all modules (CONSTRUCTION,
 * REPAIR, etc.); these columns become available to every module without
 * further migrations.
 */
export class Migration20260507150000_AddTeamAssignmentMetadata extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `ALTER TABLE record_assignments
         ADD COLUMN IF NOT EXISTS role VARCHAR(100),
         ADD COLUMN IF NOT EXISTS department VARCHAR(150),
         ADD COLUMN IF NOT EXISTS phone VARCHAR(30);`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `ALTER TABLE record_assignments
         DROP COLUMN IF EXISTS phone,
         DROP COLUMN IF EXISTS department,
         DROP COLUMN IF EXISTS role;`,
    );
  }
}
