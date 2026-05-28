import { Migration } from '@mikro-orm/migrations';

/**
 * Phase KY-D1: Clean up JSONB double-wrapping corruption.
 *
 * Root cause: before KY-B1, the service update() included empty arrays in the
 * SET clause. The pg driver serialized JavaScript [] as [[]] for JSONB columns
 * under certain conditions (likely type inference with enableImplicitConversion).
 *
 * This migration resets any [[]] values in all affected JSONB array columns
 * back to the correct empty array [].
 *
 * Idempotent: safe to run multiple times.
 */
export class Migration20260514080000_CleanupJsonbDoubleWrapping extends Migration {
  override async up(): Promise<void> {
    const columns = [
      'status_updates',
      'readiness_documents',
      'signatories',
      'incident_log',
      'risk_register',
      'escalation_records',
    ];

    for (const col of columns) {
      this.addSql(`
        UPDATE construction_projects
           SET ${col} = '[]'::jsonb
         WHERE ${col} = '[[]]'::jsonb
            OR jsonb_typeof(${col}) = 'array'
           AND (
             SELECT COUNT(*) FROM jsonb_array_elements(${col}) elem
              WHERE jsonb_typeof(elem) = 'array'
           ) > 0;
      `);
    }
  }

  override async down(): Promise<void> {
    // No meaningful rollback — corrupted data should not be restored
  }
}
