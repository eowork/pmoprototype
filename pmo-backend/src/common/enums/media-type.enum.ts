/**
 * Media type enum - matches PostgreSQL media_type_enum
 * Used by: media table
 */
export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  OTHER = 'OTHER',
}
