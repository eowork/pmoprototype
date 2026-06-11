import { Migration } from '@mikro-orm/migrations';

export class Migration20260609000000_AddFractionFieldsToOperationIndicators extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE operation_indicators
        ADD COLUMN IF NOT EXISTS numerator_q1   DECIMAL(12,4) NULL,
        ADD COLUMN IF NOT EXISTS denominator_q1 DECIMAL(12,4) NULL,
        ADD COLUMN IF NOT EXISTS numerator_q2   DECIMAL(12,4) NULL,
        ADD COLUMN IF NOT EXISTS denominator_q2 DECIMAL(12,4) NULL,
        ADD COLUMN IF NOT EXISTS numerator_q3   DECIMAL(12,4) NULL,
        ADD COLUMN IF NOT EXISTS denominator_q3 DECIMAL(12,4) NULL,
        ADD COLUMN IF NOT EXISTS numerator_q4   DECIMAL(12,4) NULL,
        ADD COLUMN IF NOT EXISTS denominator_q4 DECIMAL(12,4) NULL
    `);
  }

  async down(): Promise<void> {
    this.addSql(`
      ALTER TABLE operation_indicators
        DROP COLUMN IF EXISTS numerator_q1,
        DROP COLUMN IF EXISTS denominator_q1,
        DROP COLUMN IF EXISTS numerator_q2,
        DROP COLUMN IF EXISTS denominator_q2,
        DROP COLUMN IF EXISTS numerator_q3,
        DROP COLUMN IF EXISTS denominator_q3,
        DROP COLUMN IF EXISTS numerator_q4,
        DROP COLUMN IF EXISTS denominator_q4
    `);
  }
}
