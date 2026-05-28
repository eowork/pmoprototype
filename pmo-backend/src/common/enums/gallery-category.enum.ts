/**
 * Gallery category enum — aligned with client prototype vocabulary (Phase JW-C).
 * Used by: construction_gallery table (VARCHAR(50)).
 *
 * Migration20260507130000_AlignGalleryCategoryEnum maps legacy values:
 *   PROGRESS    → IN_PROGRESS
 *   AFTER       → COMPLETED
 *   AERIAL      → DOCUMENTATION
 *   DETAIL      → DOCUMENTATION
 *   INSPECTION  → DOCUMENTATION
 */
export enum GalleryCategory {
  BEFORE = 'BEFORE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DOCUMENTATION = 'DOCUMENTATION',
  PROFILE = 'PROFILE',
}
