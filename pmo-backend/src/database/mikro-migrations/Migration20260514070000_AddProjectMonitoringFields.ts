import { Migration } from '@mikro-orm/migrations';

/**
 * Phase KW-F1: Add project monitoring JSONB fields to construction_projects.
 *
 * Three new operational log arrays:
 *   - incident_log:       special concerns, incidents, urgent matters
 *   - risk_register:      project risks with likelihood/impact/mitigation
 *   - escalation_records: escalation events with resolution tracking
 *
 * All default to empty JSON arrays. Stored as JSONB for flexible schema
 * evolution; can be migrated to dedicated tables if search/reporting needed.
 */
export class Migration20260514070000_AddProjectMonitoringFields extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE construction_projects
        ADD COLUMN IF NOT EXISTS incident_log       JSONB NOT NULL DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS risk_register      JSONB NOT NULL DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS escalation_records JSONB NOT NULL DEFAULT '[]'::jsonb;
    `);
  }

  override async down(): Promise<void> {
    this.addSql(`
      ALTER TABLE construction_projects
        DROP COLUMN IF EXISTS incident_log,
        DROP COLUMN IF EXISTS risk_register,
        DROP COLUMN IF EXISTS escalation_records;
    `);
  }
}
