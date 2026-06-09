import { Migration } from '@mikro-orm/migrations';

/**
 * Phase KD-E: Project Diary — daily/site-log entries attached to a construction project.
 * Hard-delete only (no deleted_at) per KD-G8.
 * Cascade delete with parent project per ON DELETE CASCADE.
 */
export class Migration20260514010000_AddConstructionDiaryEntries extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE IF NOT EXISTS construction_diary_entries (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id  UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
        entry_date  DATE NOT NULL,
        title       VARCHAR(255),
        content     TEXT NOT NULL,
        author_id   UUID REFERENCES users(id),
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    this.addSql(`
      CREATE INDEX IF NOT EXISTS idx_diary_entries_project_id
        ON construction_diary_entries(project_id);
    `);
    this.addSql(`
      CREATE INDEX IF NOT EXISTS idx_diary_entries_entry_date
        ON construction_diary_entries(project_id, entry_date DESC);
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS construction_diary_entries;`);
  }
}
