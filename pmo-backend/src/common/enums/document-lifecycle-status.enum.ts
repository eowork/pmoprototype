/**
 * Document lifecycle status — Phase JW-D.
 *
 * Independent of the pipeline `status` column (`ready`/`processing`/`failed`).
 * Drives client-side filter tabs (Active / Archived / Draft).
 */
export enum DocumentLifecycleStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  DRAFT = 'DRAFT',
}
