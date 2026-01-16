/**
 * UrgencyLevel enum - matches PostgreSQL urgency_level_enum
 * Source: pmo_schema_pg.sql line 23
 */
export enum UrgencyLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}
