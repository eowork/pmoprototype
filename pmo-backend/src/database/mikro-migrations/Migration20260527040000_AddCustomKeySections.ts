import { Migration } from '@mikro-orm/migrations';

export class Migration20260527040000_AddCustomKeySections extends Migration {
  async up(): Promise<void> {
    await this.execute(`
      ALTER TABLE construction_projects
        ADD COLUMN IF NOT EXISTS custom_key_sections JSONB DEFAULT '[]'
    `);
  }

  async down(): Promise<void> {
    await this.execute(`
      ALTER TABLE construction_projects
        DROP COLUMN IF EXISTS custom_key_sections
    `);
  }
}
