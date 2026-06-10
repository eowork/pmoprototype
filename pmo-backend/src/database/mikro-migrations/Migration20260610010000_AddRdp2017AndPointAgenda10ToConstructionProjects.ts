import { Migration } from '@mikro-orm/migrations';

export class Migration20260610010000_AddRdp2017AndPointAgenda10ToConstructionProjects extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE construction_projects
        ADD COLUMN IF NOT EXISTS rdp2017_alignment JSONB,
        ADD COLUMN IF NOT EXISTS point_agenda_10 JSONB,
        ADD COLUMN IF NOT EXISTS implementation_period VARCHAR(100)
    `);
  }

  async down(): Promise<void> {
    this.addSql(`
      ALTER TABLE construction_projects
        DROP COLUMN IF EXISTS rdp2017_alignment,
        DROP COLUMN IF EXISTS point_agenda_10,
        DROP COLUMN IF EXISTS implementation_period
    `);
  }
}
