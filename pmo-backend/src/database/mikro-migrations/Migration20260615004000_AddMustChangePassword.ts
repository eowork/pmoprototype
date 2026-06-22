import { Migration } from '@mikro-orm/migrations';

/**
 * PHASE BBBC (Track 4) — forced first-login password change.
 * Set true on admin password-reset accept and new admin-created accounts; cleared on change.
 * Existing users default false (no forced change for established accounts).
 */
export class Migration20260615004000_AddMustChangePassword extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false
    `);
  }

  async down(): Promise<void> {
    this.addSql(`ALTER TABLE users DROP COLUMN IF EXISTS must_change_password`);
  }
}
