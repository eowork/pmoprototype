/**
 * ProjectStatus enum - matches PostgreSQL project_status_enum
 * Source: pmo_schema_pg.sql line 21
 */
export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED',
}
