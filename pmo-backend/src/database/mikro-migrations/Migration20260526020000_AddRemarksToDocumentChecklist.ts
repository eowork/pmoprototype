import { Migration } from '@mikro-orm/migrations';

export class Migration20260526020000_AddRemarksToDocumentChecklist extends Migration {
  async up(): Promise<void> {
    await this.execute(`
      ALTER TABLE construction_document_checklist
        ADD COLUMN IF NOT EXISTS remarks TEXT NULL
    `);
  }

  async down(): Promise<void> {
    await this.execute(`
      ALTER TABLE construction_document_checklist
        DROP COLUMN IF EXISTS remarks
    `);
  }
}
