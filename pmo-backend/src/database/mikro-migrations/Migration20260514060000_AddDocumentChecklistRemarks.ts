import { Migration } from '@mikro-orm/migrations';

/**
 * Phase KV-D1: Add document_checklist_remarks JSONB column to construction_projects.
 *
 * Stores per-group evaluator remarks for the Document Compliance Checklist,
 * keyed by groupCode (e.g. { "CONTRACT_FOUNDATION": "Missing signed NTP." }).
 * Updated via PATCH /api/construction-projects/:id/document-remarks.
 *
 * Corresponds to: ConstructionProject.documentChecklistRemarks in
 *   src/database/entities/construction-project.entity.ts
 */
export class Migration20260514060000_AddDocumentChecklistRemarks extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE construction_projects
        ADD COLUMN IF NOT EXISTS document_checklist_remarks JSONB NOT NULL DEFAULT '{}'::jsonb;
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`
      ALTER TABLE construction_projects
        DROP COLUMN IF EXISTS document_checklist_remarks;
    `);
  }
}
