import { Migration } from '@mikro-orm/migrations';

export class Migration20260525010000_UnifyContractorUsers extends Migration {
  async up(): Promise<void> {
    // ── 1. Drop FK from contractor_invite_tokens.accepted_by → contractor_users ──
    await this.execute(`
      ALTER TABLE contractor_invite_tokens
        DROP CONSTRAINT IF EXISTS contractor_invite_tokens_accepted_by_fkey;
    `);

    // ── 2. Drop UNIQUE constraint on (project_id, contractor_user_id) ──
    await this.execute(`
      ALTER TABLE project_contractor_assignments
        DROP CONSTRAINT IF EXISTS project_contractor_assignments_project_id_contractor_user_id_key;
    `);

    // ── 3. Drop FK from project_contractor_assignments.contractor_user_id → contractor_users ──
    await this.execute(`
      ALTER TABLE project_contractor_assignments
        DROP CONSTRAINT IF EXISTS project_contractor_assignments_contractor_user_id_fkey;
    `);

    // ── 4. Rename column contractor_user_id → user_id ──
    await this.execute(`
      ALTER TABLE project_contractor_assignments
        RENAME COLUMN contractor_user_id TO user_id;
    `);

    // ── 5. Delete orphaned rows referencing old contractor_users IDs not in users ──
    await this.execute(`
      DELETE FROM project_contractor_assignments
      WHERE user_id NOT IN (SELECT id FROM users);
    `);

    // ── 6. Add FK user_id → users(id) ──
    await this.execute(`
      ALTER TABLE project_contractor_assignments
        ADD CONSTRAINT pca_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    `);

    // ── 7. Re-add UNIQUE constraint on (project_id, user_id) ──
    await this.execute(`
      ALTER TABLE project_contractor_assignments
        ADD CONSTRAINT pca_project_user_unique
        UNIQUE (project_id, user_id);
    `);

    // ── 8. NULL out accepted_by values that reference old contractor_users IDs ──
    await this.execute(`
      UPDATE contractor_invite_tokens
      SET accepted_by = NULL
      WHERE accepted_by IS NOT NULL
        AND accepted_by NOT IN (SELECT id FROM users);
    `);

    // ── 9. Add FK accepted_by → users(id) ──
    await this.execute(`
      ALTER TABLE contractor_invite_tokens
        ADD CONSTRAINT cit_accepted_by_fkey
        FOREIGN KEY (accepted_by) REFERENCES users(id) ON DELETE SET NULL;
    `);

    // ── 10. Insert Contractor role if absent ──
    await this.execute(`
      INSERT INTO roles (id, name, description, created_at, updated_at)
      VALUES (gen_random_uuid(), 'Contractor', 'External contractor with scoped project access', NOW(), NOW())
      ON CONFLICT (name) DO NOTHING;
    `);
  }

  async down(): Promise<void> {
    await this.execute(`DELETE FROM roles WHERE name = 'Contractor';`);
    await this.execute(`
      ALTER TABLE contractor_invite_tokens
        DROP CONSTRAINT IF EXISTS cit_accepted_by_fkey;
    `);
    await this.execute(`
      ALTER TABLE project_contractor_assignments
        DROP CONSTRAINT IF EXISTS pca_project_user_unique;
    `);
    await this.execute(`
      ALTER TABLE project_contractor_assignments
        DROP CONSTRAINT IF EXISTS pca_user_id_fkey;
    `);
    await this.execute(`
      ALTER TABLE project_contractor_assignments
        RENAME COLUMN user_id TO contractor_user_id;
    `);
    await this.execute(`
      ALTER TABLE project_contractor_assignments
        ADD CONSTRAINT project_contractor_assignments_contractor_user_id_fkey
        FOREIGN KEY (contractor_user_id) REFERENCES contractor_users(id) ON DELETE CASCADE;
    `);
    await this.execute(`
      ALTER TABLE project_contractor_assignments
        ADD CONSTRAINT project_contractor_assignments_project_id_contractor_user_id_key
        UNIQUE (project_id, contractor_user_id);
    `);
    await this.execute(`
      ALTER TABLE contractor_invite_tokens
        ADD CONSTRAINT contractor_invite_tokens_accepted_by_fkey
        FOREIGN KEY (accepted_by) REFERENCES contractor_users(id);
    `);
  }
}
