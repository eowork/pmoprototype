import { Migration } from '@mikro-orm/migrations';

export class Migration20260610000000_AddTargetFractionAndNotesToOperationIndicators extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE operation_indicators
        ADD COLUMN IF NOT EXISTS target_numerator_q1   DECIMAL(12,4) NULL,
        ADD COLUMN IF NOT EXISTS target_denominator_q1 DECIMAL(12,4) NULL,
        ADD COLUMN IF NOT EXISTS target_numerator_q2   DECIMAL(12,4) NULL,
        ADD COLUMN IF NOT EXISTS target_denominator_q2 DECIMAL(12,4) NULL,
        ADD COLUMN IF NOT EXISTS target_numerator_q3   DECIMAL(12,4) NULL,
        ADD COLUMN IF NOT EXISTS target_denominator_q3 DECIMAL(12,4) NULL,
        ADD COLUMN IF NOT EXISTS target_numerator_q4   DECIMAL(12,4) NULL,
        ADD COLUMN IF NOT EXISTS target_denominator_q4 DECIMAL(12,4) NULL,
        ADD COLUMN IF NOT EXISTS remarks_q1 TEXT NULL,
        ADD COLUMN IF NOT EXISTS remarks_q2 TEXT NULL,
        ADD COLUMN IF NOT EXISTS remarks_q3 TEXT NULL,
        ADD COLUMN IF NOT EXISTS remarks_q4 TEXT NULL,
        ADD COLUMN IF NOT EXISTS override_total_target_fraction TEXT NULL,
        ADD COLUMN IF NOT EXISTS override_total_actual_fraction TEXT NULL
    `);
  }

  async down(): Promise<void> {
    this.addSql(`
      ALTER TABLE operation_indicators
        DROP COLUMN IF EXISTS target_numerator_q1,
        DROP COLUMN IF EXISTS target_denominator_q1,
        DROP COLUMN IF EXISTS target_numerator_q2,
        DROP COLUMN IF EXISTS target_denominator_q2,
        DROP COLUMN IF EXISTS target_numerator_q3,
        DROP COLUMN IF EXISTS target_denominator_q3,
        DROP COLUMN IF EXISTS target_numerator_q4,
        DROP COLUMN IF EXISTS target_denominator_q4,
        DROP COLUMN IF EXISTS remarks_q1,
        DROP COLUMN IF EXISTS remarks_q2,
        DROP COLUMN IF EXISTS remarks_q3,
        DROP COLUMN IF EXISTS remarks_q4,
        DROP COLUMN IF EXISTS override_total_target_fraction,
        DROP COLUMN IF EXISTS override_total_actual_fraction
    `);
  }
}
