import { Migration } from '@mikro-orm/migrations';

/**
 * Phase AAAK — Two-Level Funding Structure.
 *
 * Adds a controlled Level-1 category (`primary_funding_source`) used for analytics/filtering,
 * plus a free-text Level-2 `funding_source_description` for detailed reporting/audit.
 *
 * Backfill: existing projects linked to the legacy "GAA" funding_sources row get
 * primary_funding_source='GAA'; everything else defaults to 'OTHER' (operator should review).
 *
 * The legacy `funding_source_id` FK is preserved (additive convention) but made nullable so
 * new projects no longer need to populate it — it becomes historical.
 */
export class Migration20260611120000_AddTwoLevelFundingToConstructionProjects extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE construction_projects
        ADD COLUMN IF NOT EXISTS primary_funding_source VARCHAR(30),
        ADD COLUMN IF NOT EXISTS funding_source_description VARCHAR(255)
    `);

    // Backfill Level-1 from the legacy FK: any project pointing to a funding_sources row
    // whose name begins with "GAA" maps to the GAA category; all others -> OTHER.
    this.addSql(`
      UPDATE construction_projects cp
      SET primary_funding_source = 'GAA'
      FROM funding_sources fs
      WHERE cp.funding_source_id = fs.id
        AND fs.name ILIKE 'GAA%'
        AND cp.primary_funding_source IS NULL
    `);
    this.addSql(`
      UPDATE construction_projects
      SET primary_funding_source = 'OTHER'
      WHERE primary_funding_source IS NULL
    `);

    // New projects don't need the legacy FK anymore.
    this.addSql(`
      ALTER TABLE construction_projects
        ALTER COLUMN funding_source_id DROP NOT NULL
    `);
  }

  async down(): Promise<void> {
    this.addSql(`
      ALTER TABLE construction_projects
        ALTER COLUMN funding_source_id SET NOT NULL
    `);
    this.addSql(`
      ALTER TABLE construction_projects
        DROP COLUMN IF EXISTS funding_source_description,
        DROP COLUMN IF EXISTS primary_funding_source
    `);
  }
}
