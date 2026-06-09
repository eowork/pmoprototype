import { Migration } from '@mikro-orm/migrations';

/**
 * Phase KZ-A: Prepend /uploads/ to existing file paths in DB.
 *
 * Root cause: StorageService previously returned a bare relative path
 * (e.g. "construction_gallery/projectId/uuid_name.jpg"). The /uploads/ prefix
 * was only added in KY-A2 for new uploads. This migration backfills all
 * existing records so their stored paths resolve via the /uploads static server.
 *
 * Conditions:
 *  - Path must not already start with /uploads/ (idempotent)
 *  - Path must not be an http/https URL (external links left unchanged)
 *  - Path must not be NULL
 *
 * Tables affected: construction_gallery (image_url), documents (file_path)
 */
export class Migration20260514090000_FixExistingFilePaths extends Migration {
  override async up(): Promise<void> {
    // Fix gallery image URLs
    this.addSql(`
      UPDATE construction_gallery
         SET image_url = '/uploads/' || image_url
       WHERE image_url IS NOT NULL
         AND image_url NOT LIKE '/uploads/%'
         AND image_url NOT LIKE 'http://%'
         AND image_url NOT LIKE 'https://%';
    `);

    // Fix document file paths (skip external links stored as full URLs)
    this.addSql(`
      UPDATE documents
         SET file_path = '/uploads/' || file_path
       WHERE file_path IS NOT NULL
         AND file_path NOT LIKE '/uploads/%'
         AND file_path NOT LIKE 'http://%'
         AND file_path NOT LIKE 'https://%';
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`
      UPDATE construction_gallery
         SET image_url = SUBSTRING(image_url FROM 10)
       WHERE image_url LIKE '/uploads/%';
    `);

    this.addSql(`
      UPDATE documents
         SET file_path = SUBSTRING(file_path FROM 10)
       WHERE file_path LIKE '/uploads/%'
         AND file_path NOT LIKE 'https://%';
    `);
  }
}
