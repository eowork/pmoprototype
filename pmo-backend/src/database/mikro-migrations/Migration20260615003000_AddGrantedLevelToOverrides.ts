import { Migration } from '@mikro-orm/migrations';

/**
 * PHASE BBBC (Track 8a) — per-action access levels.
 *
 * Adds `granted_level` to `user_permission_overrides` so module ENTRY (can_access) is separated
 * from the CRUD tier (level). Grandfathers existing granted modules to 'Contributor' so current
 * non-admin users keep their create/update ability — NO regression (operator decision).
 */
export class Migration20260615003000_AddGrantedLevelToOverrides extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE user_permission_overrides
        ADD COLUMN IF NOT EXISTS granted_level varchar(30)
    `);
    // Grandfather: any currently-granted module → Contributor (preserve existing CRUD).
    this.addSql(`
      UPDATE user_permission_overrides
      SET granted_level = 'Contributor'
      WHERE can_access = true AND granted_level IS NULL
    `);
  }

  async down(): Promise<void> {
    this.addSql(
      `ALTER TABLE user_permission_overrides DROP COLUMN IF EXISTS granted_level`,
    );
  }
}
