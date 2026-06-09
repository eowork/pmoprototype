import { Migration } from '@mikro-orm/migrations';

/**
 * Phase NI (2026-05-21): Archive (RENAME, do not DROP) ConstructionProjectFinancial.
 * Chronological tracking is superseded by construction_progress_reports.
 * Existing financial records are preserved for COA audit; no data loss.
 */
export class Migration20260522030000_ArchiveConstructionFinancials extends Migration {
  async up(): Promise<void> {
    this.addSql(
      `ALTER TABLE construction_project_financials RENAME TO _archived_construction_project_financials_20260522`,
    );
  }

  async down(): Promise<void> {
    this.addSql(
      `ALTER TABLE _archived_construction_project_financials_20260522 RENAME TO construction_project_financials`,
    );
  }
}
