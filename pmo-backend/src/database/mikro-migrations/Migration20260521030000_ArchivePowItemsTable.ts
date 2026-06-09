import { Migration } from '@mikro-orm/migrations';

export class Migration20260521030000_ArchivePowItemsTable extends Migration {
  async up(): Promise<void> {
    this.addSql(
      `ALTER TABLE construction_pow_items RENAME TO _archived_construction_pow_items_20260521`,
    );
  }

  async down(): Promise<void> {
    this.addSql(
      `ALTER TABLE _archived_construction_pow_items_20260521 RENAME TO construction_pow_items`,
    );
  }
}
