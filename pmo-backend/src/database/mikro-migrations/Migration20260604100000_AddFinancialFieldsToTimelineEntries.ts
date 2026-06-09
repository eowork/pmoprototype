import { Migration } from '@mikro-orm/migrations';

export class Migration20260604100000_AddFinancialFieldsToTimelineEntries extends Migration {
  async up(): Promise<void> {
    await this.execute(`
      ALTER TABLE construction_timeline_entries
        ADD COLUMN IF NOT EXISTS billing_amount_this_period DECIMAL(15,2),
        ADD COLUMN IF NOT EXISTS financial_accomplishment_percent DECIMAL(5,2);
      COMMENT ON COLUMN construction_timeline_entries.billing_amount_this_period
        IS 'BBB-C: Billing billed to owner this period (WAR/MPR operational record; Progress Reports is the official record)';
      COMMENT ON COLUMN construction_timeline_entries.financial_accomplishment_percent
        IS 'BBB-C: Financial accomplishment % this period (WAR/MPR operational; Progress Reports is official)';
    `);
  }

  async down(): Promise<void> {
    await this.execute(`
      ALTER TABLE construction_timeline_entries
        DROP COLUMN IF EXISTS billing_amount_this_period,
        DROP COLUMN IF EXISTS financial_accomplishment_percent;
    `);
  }
}
