import { Migration } from '@mikro-orm/migrations';

/**
 * Phase JW-G: Timeline diary subsystem for construction projects.
 *
 * Creates a normalized `construction_timeline_entries` table independent of
 * the milestone subsystem. Stores per-project periodic diary entries
 * (daily/weekly/monthly/quarterly) with weather, manpower, equipment, work
 * accomplished, and issues encountered — populated admin-side and consumed
 * by the client prototype's Timeline tab.
 *
 * `entry_type` is VARCHAR + CHECK (matches the gallery/document convention
 * already established in Phase JW; avoids PG ENUM rigidity).
 *
 * `timelineData JSONB` on `construction_projects` is intentionally NOT removed
 * (unused stub; harmless; out-of-scope per JW-D7).
 */
export class Migration20260507160000_AddConstructionTimelineEntries extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `CREATE TABLE IF NOT EXISTS construction_timeline_entries (
         id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
         project_id         UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
         entry_type         VARCHAR(20) NOT NULL DEFAULT 'WEEKLY',
         entry_date         DATE NOT NULL,
         period_label       VARCHAR(100),
         title              VARCHAR(255) NOT NULL,
         description        TEXT,
         weather            VARCHAR(100),
         manpower_count     INTEGER,
         equipment_used     TEXT,
         work_accomplished  TEXT,
         issues_encountered TEXT,
         photos_count       INTEGER NOT NULL DEFAULT 0,
         created_by         UUID REFERENCES users(id),
         created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
         updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
         CONSTRAINT construction_timeline_entries_entry_type_check
           CHECK (entry_type IN ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY'))
       );`,
    );

    this.addSql(
      `CREATE INDEX IF NOT EXISTS idx_timeline_entries_project_id
         ON construction_timeline_entries (project_id);`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS idx_timeline_entries_entry_date
         ON construction_timeline_entries (entry_date DESC);`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`DROP INDEX IF EXISTS idx_timeline_entries_entry_date;`);
    this.addSql(`DROP INDEX IF EXISTS idx_timeline_entries_project_id;`);
    this.addSql(`DROP TABLE IF EXISTS construction_timeline_entries;`);
  }
}
