import { Migration } from '@mikro-orm/migrations';

export class Migration20260520010000_AddMilestoneAuditFields extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE construction_milestones
        ADD COLUMN IF NOT EXISTS created_by VARCHAR(36),
        ADD COLUMN IF NOT EXISTS updated_by VARCHAR(36),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
    `);
  }

  async down(): Promise<void> {
    this.addSql(`
      ALTER TABLE construction_milestones
        DROP COLUMN IF EXISTS created_by,
        DROP COLUMN IF EXISTS updated_by,
        DROP COLUMN IF EXISTS updated_at;
    `);
  }
}
