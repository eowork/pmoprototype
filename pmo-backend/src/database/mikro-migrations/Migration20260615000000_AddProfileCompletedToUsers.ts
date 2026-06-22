import { Migration } from '@mikro-orm/migrations';

/**
 * PHASE BBBA (BBBA-1e) — first-login profile-completion flag.
 *
 * Adds `users.profile_completed`. Existing users are backfilled to TRUE so they are
 * NOT forced through the (future, Phase 1B) onboarding gate; new accounts default FALSE.
 */
export class Migration20260615000000_AddProfileCompletedToUsers extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS profile_completed boolean NOT NULL DEFAULT false
    `);
    // Existing accounts are already established — treat their profiles as complete.
    this.addSql(`UPDATE users SET profile_completed = true`);
  }

  async down(): Promise<void> {
    this.addSql(`ALTER TABLE users DROP COLUMN IF EXISTS profile_completed`);
  }
}
