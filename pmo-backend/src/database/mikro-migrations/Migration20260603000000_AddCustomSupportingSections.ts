import { Migration } from '@mikro-orm/migrations';

export class Migration20260603000000_AddCustomSupportingSections extends Migration {
  async up(): Promise<void> {
    await this.execute(`
      ALTER TABLE construction_projects
        ADD COLUMN IF NOT EXISTS custom_supporting_sections JSONB DEFAULT '[]';
      COMMENT ON COLUMN construction_projects.custom_supporting_sections
        IS 'Per-project custom Supporting Document repository folders (rendered as repository cards) — mirrors custom_key_sections';
    `);
  }

  async down(): Promise<void> {
    await this.execute(`
      ALTER TABLE construction_projects DROP COLUMN IF EXISTS custom_supporting_sections;
    `);
  }
}
