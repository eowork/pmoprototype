import { Migration } from '@mikro-orm/migrations';

/**
 * Phase JN-A: Soft-delete-aware unique index on project_code.
 *
 * The plain UNIQUE constraint enforces uniqueness across ALL rows including
 * soft-deleted ones, blocking re-use of project codes after soft-delete.
 * Replace with a partial unique index that only enforces uniqueness for
 * rows where deleted_at IS NULL.
 *
 * Applied to both `projects` (parent / cross-module) and `construction_projects`
 * (extension) for consistency.
 */
export class Migration20260502071146_PartialUniqueProjectCode extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_project_code_key;`,
    );
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS projects_project_code_active_idx
       ON projects (project_code) WHERE deleted_at IS NULL;`,
    );

    this.addSql(
      `ALTER TABLE construction_projects DROP CONSTRAINT IF EXISTS construction_projects_project_code_key;`,
    );
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS construction_projects_project_code_active_idx
       ON construction_projects (project_code) WHERE deleted_at IS NULL;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`DROP INDEX IF EXISTS projects_project_code_active_idx;`);
    this.addSql(
      `ALTER TABLE projects ADD CONSTRAINT projects_project_code_key UNIQUE (project_code);`,
    );
    this.addSql(
      `DROP INDEX IF EXISTS construction_projects_project_code_active_idx;`,
    );
    this.addSql(
      `ALTER TABLE construction_projects ADD CONSTRAINT construction_projects_project_code_key UNIQUE (project_code);`,
    );
  }
}
