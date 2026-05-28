import { Migration } from '@mikro-orm/migrations';

export class Migration20260507200000_RelaxPowItemNumber extends Migration {
  async up(): Promise<void> {
    // item_number was removed from the ConstructionPowItem entity in Phase JU-B.
    // The draft-schema NOT NULL constraint blocks every ORM INSERT.
    // Making the column nullable reconciles the DB with the current entity design.
    await this.execute(
      `ALTER TABLE construction_pow_items ALTER COLUMN item_number DROP NOT NULL`,
    );
  }

  async down(): Promise<void> {
    await this.execute(
      `ALTER TABLE construction_pow_items ALTER COLUMN item_number SET NOT NULL`,
    );
  }
}
