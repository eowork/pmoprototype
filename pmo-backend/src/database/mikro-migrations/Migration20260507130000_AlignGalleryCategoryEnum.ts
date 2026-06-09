import { Migration } from '@mikro-orm/migrations';

/**
 * Phase JW-C: Align construction_gallery.category vocabulary with client prototype.
 *
 * The column is VARCHAR(50) (not a PostgreSQL ENUM type), so this is a pure
 * data migration plus a default-value swap — no DROP TYPE / table recreation
 * required.
 *
 * Vocabulary mapping:
 *   PROGRESS  → IN_PROGRESS     (active construction phase)
 *   AFTER     → COMPLETED       (finished/handed over)
 *   BEFORE    → BEFORE          (unchanged)
 *   AERIAL    → DOCUMENTATION   (legacy, never written by app — defensive)
 *   DETAIL    → DOCUMENTATION   (legacy, never written by app — defensive)
 *   INSPECTION→ DOCUMENTATION   (frontend-only legacy value — defensive)
 *
 * Final domain: BEFORE | IN_PROGRESS | COMPLETED | DOCUMENTATION.
 */
export class Migration20260507130000_AlignGalleryCategoryEnum extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `UPDATE construction_gallery SET category = 'IN_PROGRESS' WHERE category = 'PROGRESS';`,
    );
    this.addSql(
      `UPDATE construction_gallery SET category = 'COMPLETED' WHERE category = 'AFTER';`,
    );
    this.addSql(
      `UPDATE construction_gallery SET category = 'DOCUMENTATION'
         WHERE category IN ('AERIAL', 'DETAIL', 'INSPECTION');`,
    );

    this.addSql(
      `ALTER TABLE construction_gallery
         ALTER COLUMN category SET DEFAULT 'IN_PROGRESS';`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `ALTER TABLE construction_gallery
         ALTER COLUMN category SET DEFAULT 'PROGRESS';`,
    );

    this.addSql(
      `UPDATE construction_gallery SET category = 'PROGRESS' WHERE category = 'IN_PROGRESS';`,
    );
    this.addSql(
      `UPDATE construction_gallery SET category = 'AFTER' WHERE category = 'COMPLETED';`,
    );
    // DOCUMENTATION rows cannot be reliably attributed back to AERIAL/DETAIL/INSPECTION;
    // leave them as DOCUMENTATION on rollback. This is a forward-only vocabulary change.
  }
}
