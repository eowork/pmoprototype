import { Migration } from '@mikro-orm/migrations';

export class Migration20260602000000_AddSdgGoalsToConstructionProjects extends Migration {
  async up(): Promise<void> {
    await this.execute(`
      ALTER TABLE construction_projects
        ADD COLUMN IF NOT EXISTS sdg_goals JSONB DEFAULT '[]';
      COMMENT ON COLUMN construction_projects.sdg_goals
        IS 'UN Sustainable Development Goals aligned with this project (array of SDG_n keys)';
    `);
  }

  async down(): Promise<void> {
    await this.execute(`
      ALTER TABLE construction_projects DROP COLUMN IF EXISTS sdg_goals;
    `);
  }
}
