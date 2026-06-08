import { Migration } from '@mikro-orm/migrations';

export class Migration20260603300000_AddProjectNotesBanking extends Migration {
  async up(): Promise<void> {
    await this.execute(`
      ALTER TABLE construction_projects
        ADD COLUMN IF NOT EXISTS project_notes_banking JSONB DEFAULT NULL;
      COMMENT ON COLUMN construction_projects.project_notes_banking
        IS 'GGG-E: Others-tab data banking — additionalNotes, projectReferences[], specialInstructions, historicalReferences[], customMetadata{}';
    `);
  }

  async down(): Promise<void> {
    await this.execute(`
      ALTER TABLE construction_projects DROP COLUMN IF EXISTS project_notes_banking;
    `);
  }
}
