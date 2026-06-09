import { Migration } from '@mikro-orm/migrations';

export class Migration20260528010000_AddConstructionDocumentFolders extends Migration {
  async up(): Promise<void> {
    await this.execute(`
      CREATE TABLE IF NOT EXISTS construction_document_folders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
        parent_id UUID NULL REFERENCES construction_document_folders(id) ON DELETE CASCADE,
        folder_name VARCHAR(200) NOT NULL,
        group_code VARCHAR(50) NULL,
        node_type VARCHAR(30) NOT NULL DEFAULT 'CONTAINER',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_by UUID NULL REFERENCES users(id),
        updated_by UUID NULL REFERENCES users(id),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ NULL,
        deleted_by UUID NULL REFERENCES users(id)
      )
    `);

    await this.execute(`
      CREATE INDEX IF NOT EXISTS idx_construction_document_folders_project
        ON construction_document_folders(project_id)
    `);

    await this.execute(`
      CREATE INDEX IF NOT EXISTS idx_construction_document_folders_parent
        ON construction_document_folders(parent_id)
    `);

    await this.execute(`
      ALTER TABLE documents
        ADD COLUMN IF NOT EXISTS folder_id UUID NULL REFERENCES construction_document_folders(id) ON DELETE SET NULL
    `);

    await this.execute(`
      CREATE INDEX IF NOT EXISTS idx_documents_folder_id
        ON documents(folder_id)
    `);
  }

  async down(): Promise<void> {
    await this.execute(`
      DROP INDEX IF EXISTS idx_documents_folder_id
    `);
    await this.execute(`
      ALTER TABLE documents DROP COLUMN IF EXISTS folder_id
    `);

    await this.execute(`
      DROP INDEX IF EXISTS idx_construction_document_folders_parent
    `);
    await this.execute(`
      DROP INDEX IF EXISTS idx_construction_document_folders_project
    `);
    await this.execute(`
      DROP TABLE IF EXISTS construction_document_folders
    `);
  }
}
