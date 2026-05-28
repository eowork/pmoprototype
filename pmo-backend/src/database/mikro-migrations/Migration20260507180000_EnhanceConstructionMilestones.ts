import { Migration } from '@mikro-orm/migrations';

/**
 * Phase JY-A: Add Phase JU-A-1 milestone columns that were never applied to DB.
 *
 * `construction_milestones` was bootstrapped from a draft schema before Phase
 * JU-A-1 enhanced the entity with start_date, actual_start_date, progress, and
 * category.  The corresponding raw SQL migration (046) was written but never
 * executed against the live database.  This MikroORM migration applies the same
 * schema change so `npm run migration:up` is sufficient to unblock the Timeline
 * tab.
 *
 * All additions are IF NOT EXISTS so re-running is safe.
 */
export class Migration20260507180000_EnhanceConstructionMilestones extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `ALTER TABLE construction_milestones
         ADD COLUMN IF NOT EXISTS start_date        DATE,
         ADD COLUMN IF NOT EXISTS actual_start_date DATE,
         ADD COLUMN IF NOT EXISTS progress          DECIMAL(5,2) NOT NULL DEFAULT 0.00,
         ADD COLUMN IF NOT EXISTS category          VARCHAR(50);`,
    );

    this.addSql(
      `COMMENT ON COLUMN construction_milestones.progress IS
         'Percent completion of this milestone (0–100)';`,
    );
    this.addSql(
      `COMMENT ON COLUMN construction_milestones.category IS
         'Optional grouping: SITE_PREPARATION, STRUCTURAL, ARCHITECTURAL, MEP, FINISHING, OTHER';`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `ALTER TABLE construction_milestones
         DROP COLUMN IF EXISTS category,
         DROP COLUMN IF EXISTS progress,
         DROP COLUMN IF EXISTS actual_start_date,
         DROP COLUMN IF EXISTS start_date;`,
    );
  }
}
