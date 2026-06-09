import { Migration } from '@mikro-orm/migrations';

export class Migration20260604000000_AddConcernsListToTimelineEntries extends Migration {
  async up(): Promise<void> {
    await this.execute(`
      ALTER TABLE construction_timeline_entries
        ADD COLUMN IF NOT EXISTS concerns_list JSONB DEFAULT '[]';
      COMMENT ON COLUMN construction_timeline_entries.concerns_list
        IS 'ZZZ-G: [{title,description,category,severity,status,responsibleParty,resolutionTargetDate,actualResolutionDate,mitigationAction,createdBy,createdAt}]';
    `);
  }

  async down(): Promise<void> {
    await this.execute(`
      ALTER TABLE construction_timeline_entries
        DROP COLUMN IF EXISTS concerns_list;
    `);
  }
}
