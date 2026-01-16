/**
 * RepairStatus enum - matches PostgreSQL repair_status_enum
 * Source: pmo_schema_pg.sql line 22
 */
export enum RepairStatus {
  REPORTED = 'REPORTED',
  INSPECTED = 'INSPECTED',
  APPROVED = 'APPROVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
