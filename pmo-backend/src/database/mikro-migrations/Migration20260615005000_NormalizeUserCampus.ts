import { Migration } from '@mikro-orm/migrations';

/**
 * PHASE BBBD (Track 10d) — campus single-source rewire.
 *
 * The user pages historically stored free-text campus ("Butuan Campus" / "Cabadbaran"), which did
 * not match the Campus enum (MAIN/CABADBARAN/BOTH) used elsewhere or the shared label map. This
 * normalizes every stored value to the canonical enum key so display (labelForCampus →
 * "Butuan Campus (Main)" / "Cabadbaran Campus" / "Both Campuses") and filtering are consistent.
 *
 * Idempotent (case-insensitive match; already-canonical values are left untouched).
 */
export class Migration20260615005000_NormalizeUserCampus extends Migration {
  async up(): Promise<void> {
    // Main campus (Butuan).
    this.addSql(`
      UPDATE users SET campus = 'MAIN'
      WHERE campus IS NOT NULL
        AND lower(campus) IN ('butuan campus', 'butuan', 'main campus', 'main campus (butuan city)', 'main')
    `);
    // Cabadbaran campus.
    this.addSql(`
      UPDATE users SET campus = 'CABADBARAN'
      WHERE campus IS NOT NULL
        AND lower(campus) IN ('cabadbaran', 'cabadbaran campus')
    `);
    // Both.
    this.addSql(`
      UPDATE users SET campus = 'BOTH'
      WHERE campus IS NOT NULL
        AND lower(campus) IN ('both', 'both campuses')
    `);
  }

  async down(): Promise<void> {
    // No-op: original free-text values are not recoverable and not worth restoring.
  }
}
