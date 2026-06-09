import { Migration } from '@mikro-orm/migrations';

/**
 * Phase JW-D: Add lifecycle_status to documents for client-side filter tabs.
 *
 * Plan called for a PostgreSQL ENUM type, but the prevailing schema convention
 * (e.g. construction_gallery.category) is VARCHAR with application-level
 * validation. VARCHAR with a CHECK constraint gives equivalent integrity
 * without the rigidity of native enums (which can't be dropped or reordered).
 *
 * The new `lifecycle_status` column is independent of the existing pipeline
 * `status` column (`ready`/`processing`/`failed`) — both co-exist (per JW-D6).
 */
export class Migration20260507140000_AddDocumentLifecycleStatus extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `ALTER TABLE documents
         ADD COLUMN IF NOT EXISTS lifecycle_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';`,
    );

    this.addSql(
      `ALTER TABLE documents
         DROP CONSTRAINT IF EXISTS documents_lifecycle_status_check;`,
    );
    this.addSql(
      `ALTER TABLE documents
         ADD CONSTRAINT documents_lifecycle_status_check
         CHECK (lifecycle_status IN ('ACTIVE', 'ARCHIVED', 'DRAFT'));`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `ALTER TABLE documents
         DROP CONSTRAINT IF EXISTS documents_lifecycle_status_check;`,
    );
    this.addSql(
      `ALTER TABLE documents
         DROP COLUMN IF EXISTS lifecycle_status;`,
    );
  }
}
