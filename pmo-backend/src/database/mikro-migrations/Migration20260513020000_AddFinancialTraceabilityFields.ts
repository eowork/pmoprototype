import { Migration } from '@mikro-orm/migrations';

/**
 * Phase KB-F: Add operational traceability fields to construction_project_financials.
 *
 * Section 2.141-B.1 audit identified that the per-fiscal-year appropriation/
 * obligation/disbursement model was correct but lacked operational context.
 * These fields enable tying each financial record to a specific activity,
 * transaction category, billing reference, and workflow status.
 *
 * `status` defaults to 'ALLOCATED' for existing rows — preserves baseline
 * semantics: an existing row represents allocated budget by default.
 */
export class Migration20260513020000_AddFinancialTraceabilityFields extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE construction_project_financials
        ADD COLUMN IF NOT EXISTS activity_title       VARCHAR(255),
        ADD COLUMN IF NOT EXISTS transaction_category VARCHAR(100),
        ADD COLUMN IF NOT EXISTS remarks              TEXT,
        ADD COLUMN IF NOT EXISTS payment_reference    VARCHAR(100),
        ADD COLUMN IF NOT EXISTS status               VARCHAR(50) NOT NULL DEFAULT 'ALLOCATED';
    `);

    this.addSql(`
      ALTER TABLE construction_project_financials
        DROP CONSTRAINT IF EXISTS construction_financial_status_check;
    `);
    this.addSql(`
      ALTER TABLE construction_project_financials
        ADD CONSTRAINT construction_financial_status_check
        CHECK (status IN ('ALLOCATED','OBLIGATED','DISBURSED','LIQUIDATED'));
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`
      ALTER TABLE construction_project_financials
        DROP CONSTRAINT IF EXISTS construction_financial_status_check;
    `);
    this.addSql(`
      ALTER TABLE construction_project_financials
        DROP COLUMN IF EXISTS status,
        DROP COLUMN IF EXISTS payment_reference,
        DROP COLUMN IF EXISTS remarks,
        DROP COLUMN IF EXISTS transaction_category,
        DROP COLUMN IF EXISTS activity_title;
    `);
  }
}
