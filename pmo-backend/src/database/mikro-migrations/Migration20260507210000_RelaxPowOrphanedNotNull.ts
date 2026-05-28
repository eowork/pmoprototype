import { Migration } from '@mikro-orm/migrations';

export class Migration20260507210000_RelaxPowOrphanedNotNull extends Migration {
  async up(): Promise<void> {
    // Phase JU-B redesigned ConstructionPowItem and removed/made-nullable several
    // fields that the draft-schema bootstrap created as NOT NULL without a DEFAULT.
    // Each constraint blocks every ORM INSERT for that column.
    //
    // total_cost:  removed from entity entirely (replaced by estimatedProjectCost)
    // unit:        entity is nullable: true — draft schema was NOT NULL
    // quantity:    entity is nullable: true — draft schema was NOT NULL
    // unit_cost:   entity is nullable: true — draft schema was NOT NULL
    //
    // This migration performs a complete one-shot reconciliation so that the DB
    // constraints match the entity contract. No entity/DTO/service/frontend changes
    // are needed.
    await this.execute(`
      ALTER TABLE construction_pow_items
        ALTER COLUMN total_cost  DROP NOT NULL,
        ALTER COLUMN unit        DROP NOT NULL,
        ALTER COLUMN quantity    DROP NOT NULL,
        ALTER COLUMN unit_cost   DROP NOT NULL
    `);
  }

  async down(): Promise<void> {
    await this.execute(`
      ALTER TABLE construction_pow_items
        ALTER COLUMN total_cost  SET NOT NULL,
        ALTER COLUMN unit        SET NOT NULL,
        ALTER COLUMN quantity    SET NOT NULL,
        ALTER COLUMN unit_cost   SET NOT NULL
    `);
  }
}
