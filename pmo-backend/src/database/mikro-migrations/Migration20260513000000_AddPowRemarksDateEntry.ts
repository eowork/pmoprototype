import { Migration } from '@mikro-orm/migrations';

/**
 * Phase KB-B: Add audit governance fields to construction_pow_items.
 *
 * `remarks`       — administrative justification/annotation per POW line item.
 *                   Distinct from `description` (work description).
 * `date_of_entry` — user-settable record date, distinct from `start_date`
 *                   (work start) and `created_at` (auto-set). Enables
 *                   chronological record-keeping independent of system timestamps.
 *
 * Both columns are nullable — no impact on existing rows, no DEFAULT needed.
 */
export class Migration20260513000000_AddPowRemarksDateEntry extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE construction_pow_items
        ADD COLUMN IF NOT EXISTS remarks       TEXT,
        ADD COLUMN IF NOT EXISTS date_of_entry DATE;
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`
      ALTER TABLE construction_pow_items
        DROP COLUMN IF EXISTS date_of_entry,
        DROP COLUMN IF EXISTS remarks;
    `);
  }
}
