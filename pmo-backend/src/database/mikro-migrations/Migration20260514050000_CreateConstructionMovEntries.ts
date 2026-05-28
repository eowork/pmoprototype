import { Migration } from '@mikro-orm/migrations';

/**
 * Phase KS-3: Create construction_mov_entries table.
 *
 * Ports `database/migrations/048_create_construction_mov_entries.sql` (Phase KO-A)
 * into the MikroORM migration system. The raw SQL file was written after the
 * MikroORM baseline was established and was never executed against the live DB.
 *
 * Corresponds to: ConstructionMovEntry entity in
 *   src/database/entities/construction-mov-entry.entity.ts
 *
 * Polymorphic relation: `related_entity_id` references either
 *   construction_milestones(id) OR construction_timeline_entries(id).
 * Validation is enforced at the service layer — no DB-level FK to allow
 * the polymorphic pattern without a junction table.
 */
export class Migration20260514050000_CreateConstructionMovEntries extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE IF NOT EXISTS construction_mov_entries (
        id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id           UUID        NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
        related_entity_type  VARCHAR(20) NOT NULL
          CHECK (related_entity_type IN ('MILESTONE', 'TIMELINE_ENTRY')),
        related_entity_id    UUID        NOT NULL,
        mov_link             TEXT        NOT NULL,
        mov_title            VARCHAR(255) NOT NULL,
        mov_description      TEXT,
        evidence_category    VARCHAR(50) NOT NULL DEFAULT 'other',
        entry_date           DATE,
        uploaded_by          UUID REFERENCES users(id) ON DELETE SET NULL,
        verification_status  VARCHAR(20) NOT NULL DEFAULT 'PENDING'
          CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
        remarks              TEXT,
        created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    this.addSql(
      `CREATE INDEX IF NOT EXISTS idx_mov_entries_project_id
         ON construction_mov_entries (project_id);`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS idx_mov_entries_entity
         ON construction_mov_entries (related_entity_type, related_entity_id);`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`DROP INDEX IF EXISTS idx_mov_entries_entity;`);
    this.addSql(`DROP INDEX IF EXISTS idx_mov_entries_project_id;`);
    this.addSql(`DROP TABLE IF EXISTS construction_mov_entries;`);
  }
}
