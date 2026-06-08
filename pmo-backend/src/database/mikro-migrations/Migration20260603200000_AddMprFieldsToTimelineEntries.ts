import { Migration } from '@mikro-orm/migrations';

export class Migration20260603200000_AddMprFieldsToTimelineEntries extends Migration {
  async up(): Promise<void> {
    await this.execute(`
      ALTER TABLE construction_timeline_entries
        ADD COLUMN IF NOT EXISTS mpr_number VARCHAR(50),
        ADD COLUMN IF NOT EXISTS reporting_period_month DATE,
        ADD COLUMN IF NOT EXISTS work_items JSONB DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS accomplishment_summary_percent NUMERIC(5,2),
        ADD COLUMN IF NOT EXISTS percent_time_elapsed NUMERIC(5,2),
        ADD COLUMN IF NOT EXISTS original_contract_amount NUMERIC(18,2),
        ADD COLUMN IF NOT EXISTS revised_contract_amount NUMERIC(18,2);
      COMMENT ON COLUMN construction_timeline_entries.work_items
        IS 'GGG-F MPR: [{itemNumber, description, unit, quantity, unitCost, weightNumber, actualQtyThisPeriod, actualPercentToDate, costToDate}]';
    `);
  }

  async down(): Promise<void> {
    await this.execute(`
      ALTER TABLE construction_timeline_entries
        DROP COLUMN IF EXISTS mpr_number,
        DROP COLUMN IF EXISTS reporting_period_month,
        DROP COLUMN IF EXISTS work_items,
        DROP COLUMN IF EXISTS accomplishment_summary_percent,
        DROP COLUMN IF EXISTS percent_time_elapsed,
        DROP COLUMN IF EXISTS original_contract_amount,
        DROP COLUMN IF EXISTS revised_contract_amount;
    `);
  }
}
