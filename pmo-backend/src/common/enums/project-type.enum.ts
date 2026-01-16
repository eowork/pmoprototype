/**
 * ProjectType enum - matches PostgreSQL project_type_enum
 * Source: pmo_schema_pg.sql line 31
 */
export enum ProjectType {
  CONSTRUCTION = 'CONSTRUCTION',
  REPAIR = 'REPAIR',
  RESEARCH = 'RESEARCH',
  EXTENSION = 'EXTENSION',
  TRAINING = 'TRAINING',
  OTHER = 'OTHER',
}
