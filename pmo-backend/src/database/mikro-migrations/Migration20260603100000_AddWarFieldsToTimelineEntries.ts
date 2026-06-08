import { Migration } from '@mikro-orm/migrations';

export class Migration20260603100000_AddWarFieldsToTimelineEntries extends Migration {
  async up(): Promise<void> {
    await this.execute(`
      ALTER TABLE construction_timeline_entries
        ADD COLUMN IF NOT EXISTS war_number VARCHAR(50),
        ADD COLUMN IF NOT EXISTS reporting_period_start DATE,
        ADD COLUMN IF NOT EXISTS reporting_period_end DATE,
        ADD COLUMN IF NOT EXISTS personnel_equipment_constraints TEXT,
        ADD COLUMN IF NOT EXISTS mitigation_measures TEXT,
        ADD COLUMN IF NOT EXISTS look_ahead_activities TEXT,
        ADD COLUMN IF NOT EXISTS accomplishments JSONB DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS signatories JSONB DEFAULT '[]';
      COMMENT ON COLUMN construction_timeline_entries.accomplishments
        IS 'GGG-F WAR: [{description, category, date, percentage, remarks}]';
      COMMENT ON COLUMN construction_timeline_entries.signatories
        IS 'GGG-F: [{userId, userName, position, role, date}] — references system users';
    `);
  }

  async down(): Promise<void> {
    await this.execute(`
      ALTER TABLE construction_timeline_entries
        DROP COLUMN IF EXISTS war_number,
        DROP COLUMN IF EXISTS reporting_period_start,
        DROP COLUMN IF EXISTS reporting_period_end,
        DROP COLUMN IF EXISTS personnel_equipment_constraints,
        DROP COLUMN IF EXISTS mitigation_measures,
        DROP COLUMN IF EXISTS look_ahead_activities,
        DROP COLUMN IF EXISTS accomplishments,
        DROP COLUMN IF EXISTS signatories;
    `);
  }
}
