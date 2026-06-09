import { Migration } from '@mikro-orm/migrations';

export class Migration20260521010000_AddProjectNewFields extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE construction_projects
        ADD COLUMN IF NOT EXISTS contractor VARCHAR(255),
        ADD COLUMN IF NOT EXISTS spatial_coverage VARCHAR(500),
        ADD COLUMN IF NOT EXISTS municipality VARCHAR(100),
        ADD COLUMN IF NOT EXISTS province VARCHAR(100),
        ADD COLUMN IF NOT EXISTS co_implementing_agency VARCHAR(255),
        ADD COLUMN IF NOT EXISTS attached_agency VARCHAR(255),
        ADD COLUMN IF NOT EXISTS original_start_date DATE,
        ADD COLUMN IF NOT EXISTS revised_start_date DATE,
        ADD COLUMN IF NOT EXISTS original_completion_date DATE,
        ADD COLUMN IF NOT EXISTS revised_completion_date DATE,
        ADD COLUMN IF NOT EXISTS revised_project_duration VARCHAR(100),
        ADD COLUMN IF NOT EXISTS as_of_date DATE,
        ADD COLUMN IF NOT EXISTS cost_incurred_to_date DECIMAL(15,2),
        ADD COLUMN IF NOT EXISTS rdp_alignment JSONB,
        ADD COLUMN IF NOT EXISTS socioeconomic_agenda JSONB,
        ADD COLUMN IF NOT EXISTS csu_likha_goals JSONB,
        ADD COLUMN IF NOT EXISTS beneficiary_list JSONB,
        ADD COLUMN IF NOT EXISTS funding_source_type VARCHAR(20),
        ADD COLUMN IF NOT EXISTS additional_funding_sources JSONB,
        ADD COLUMN IF NOT EXISTS remarks_log JSONB NOT NULL DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS personnel_groups JSONB
    `);
  }

  async down(): Promise<void> {
    this.addSql(`
      ALTER TABLE construction_projects
        DROP COLUMN IF EXISTS contractor,
        DROP COLUMN IF EXISTS spatial_coverage,
        DROP COLUMN IF EXISTS municipality,
        DROP COLUMN IF EXISTS province,
        DROP COLUMN IF EXISTS co_implementing_agency,
        DROP COLUMN IF EXISTS attached_agency,
        DROP COLUMN IF EXISTS original_start_date,
        DROP COLUMN IF EXISTS revised_start_date,
        DROP COLUMN IF EXISTS original_completion_date,
        DROP COLUMN IF EXISTS revised_completion_date,
        DROP COLUMN IF EXISTS revised_project_duration,
        DROP COLUMN IF EXISTS as_of_date,
        DROP COLUMN IF EXISTS cost_incurred_to_date,
        DROP COLUMN IF EXISTS rdp_alignment,
        DROP COLUMN IF EXISTS socioeconomic_agenda,
        DROP COLUMN IF EXISTS csu_likha_goals,
        DROP COLUMN IF EXISTS beneficiary_list,
        DROP COLUMN IF EXISTS funding_source_type,
        DROP COLUMN IF EXISTS additional_funding_sources,
        DROP COLUMN IF EXISTS remarks_log,
        DROP COLUMN IF EXISTS personnel_groups
    `);
  }
}
