import { Migration } from '@mikro-orm/migrations';

/**
 * Phase LC-C: Enable file upload support on construction_mov_entries.
 *
 * - mov_link becomes nullable (MOV entry may have URL or file, not both required)
 * - adds file_path, file_name, file_size, mime_type for uploaded evidence files
 */
export class Migration20260518020000_MovFileUploadSupport extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE construction_mov_entries
        ALTER COLUMN mov_link DROP NOT NULL,
        ADD COLUMN IF NOT EXISTS file_path  VARCHAR(500),
        ADD COLUMN IF NOT EXISTS file_name  VARCHAR(255),
        ADD COLUMN IF NOT EXISTS file_size  INTEGER,
        ADD COLUMN IF NOT EXISTS mime_type  VARCHAR(100);
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`
      ALTER TABLE construction_mov_entries
        ALTER COLUMN mov_link SET NOT NULL,
        DROP COLUMN IF EXISTS file_path,
        DROP COLUMN IF EXISTS file_name,
        DROP COLUMN IF EXISTS file_size,
        DROP COLUMN IF EXISTS mime_type;
    `);
  }
}
