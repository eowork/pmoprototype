import { Migration } from '@mikro-orm/migrations';

/**
 * Phase KF-AB: Add PROFILE to allowed gallery categories.
 * Adds a CHECK constraint to construction_gallery.category to formally document
 * the full domain including the new PROFILE value.
 * PROFILE images are capped at 3 per project (enforced at the service layer).
 */
export class Migration20260514020000_AddProfileGalleryCategory extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE construction_gallery
        DROP CONSTRAINT IF EXISTS construction_gallery_category_check;
    `);
    this.addSql(`
      ALTER TABLE construction_gallery
        ADD CONSTRAINT construction_gallery_category_check
        CHECK (category IN ('BEFORE','IN_PROGRESS','COMPLETED','DOCUMENTATION','PROFILE'));
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`
      ALTER TABLE construction_gallery
        DROP CONSTRAINT IF EXISTS construction_gallery_category_check;
    `);
    this.addSql(`
      ALTER TABLE construction_gallery
        ADD CONSTRAINT construction_gallery_category_check
        CHECK (category IN ('BEFORE','IN_PROGRESS','COMPLETED','DOCUMENTATION'));
    `);
  }
}
