import { Migration } from '@mikro-orm/migrations';

/**
 * Phase JU-B: Program of Works (POW) line-item subsystem.
 *
 * Each construction project has a Program of Works — a list of physical work
 * items with quantity, unit, unit cost, material/labor/project cost estimates,
 * variance, schedule, and per-item progress. Independent of milestones (which
 * track key dates) and timeline diary entries (which track periodic work logs).
 *
 * `status` is VARCHAR + CHECK (consistent with the gallery/document/timeline
 * conventions established earlier in this branch).
 */
export class Migration20260507170000_AddConstructionPowItems extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `CREATE TABLE IF NOT EXISTS construction_pow_items (
         id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
         project_id               UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
         description              TEXT NOT NULL,
         progress                 DECIMAL(5,2) NOT NULL DEFAULT 0.00,
         quantity                 DECIMAL(10,3),
         unit                     VARCHAR(50),
         unit_cost                DECIMAL(15,2),
         estimated_material_cost  DECIMAL(15,2),
         estimated_labor_cost     DECIMAL(15,2),
         estimated_project_cost   DECIMAL(15,2),
         variance                 DECIMAL(15,2),
         start_date               DATE,
         end_date                 DATE,
         project_duration         VARCHAR(100),
         status                   VARCHAR(50) NOT NULL DEFAULT 'NOT_STARTED',
         category                 VARCHAR(100),
         sort_order               INTEGER NOT NULL DEFAULT 0,
         created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
         updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
         CONSTRAINT construction_pow_items_status_check
           CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'))
       );`,
    );

    this.addSql(
      `CREATE INDEX IF NOT EXISTS idx_construction_pow_items_project
         ON construction_pow_items (project_id);`,
    );
    this.addSql(
      `CREATE INDEX IF NOT EXISTS idx_construction_pow_items_status
         ON construction_pow_items (project_id, status);`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`DROP INDEX IF EXISTS idx_construction_pow_items_status;`);
    this.addSql(`DROP INDEX IF EXISTS idx_construction_pow_items_project;`);
    this.addSql(`DROP TABLE IF EXISTS construction_pow_items;`);
  }
}
