import { Migration } from '@mikro-orm/migrations';

export class Migration20260513030000_AddProjectProfileFields extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE construction_projects
        ADD COLUMN IF NOT EXISTS strategic_alignment        TEXT,
        ADD COLUMN IF NOT EXISTS output_indicators          JSONB,
        ADD COLUMN IF NOT EXISTS outcome_indicators         JSONB,
        ADD COLUMN IF NOT EXISTS implementing_agency        VARCHAR(255),
        ADD COLUMN IF NOT EXISTS project_status_category    VARCHAR(50)
          CHECK (project_status_category IN ('NEW','ONGOING','COMPLETED','SUSPENDED','CANCELLED')),
        ADD COLUMN IF NOT EXISTS status_updates             JSONB,
        ADD COLUMN IF NOT EXISTS readiness_documents        JSONB,
        ADD COLUMN IF NOT EXISTS signatories                JSONB;
    `);
  }

  async down(): Promise<void> {
    this.addSql(`
      ALTER TABLE construction_projects
        DROP COLUMN IF EXISTS signatories,
        DROP COLUMN IF EXISTS readiness_documents,
        DROP COLUMN IF EXISTS status_updates,
        DROP COLUMN IF EXISTS project_status_category,
        DROP COLUMN IF EXISTS implementing_agency,
        DROP COLUMN IF EXISTS outcome_indicators,
        DROP COLUMN IF EXISTS output_indicators,
        DROP COLUMN IF EXISTS strategic_alignment;
    `);
  }
}
