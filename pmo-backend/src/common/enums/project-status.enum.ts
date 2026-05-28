export enum ProjectStatus {
  PROPOSAL = 'PROPOSAL',
  ONGOING = 'ONGOING',
  COMPLETE = 'COMPLETE',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED',
  // NOTE: Legacy values PLANNING / COMPLETED were normalized in
  // Migration20260521050000_NormalizeProjectStatusData (2026-05-21).
  // They remain in the PostgreSQL enum type permanently (PostgreSQL forbids
  // removing enum values) but are no longer accepted by the DTO.
}
