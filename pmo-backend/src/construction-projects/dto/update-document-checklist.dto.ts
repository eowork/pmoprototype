import {
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  IsIn,
  IsInt,
  Min,
} from 'class-validator';

export const DOCUMENT_SUBMISSION_STATUSES = [
  'NOT_SUBMITTED',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
] as const;
export type DocumentSubmissionStatus =
  (typeof DOCUMENT_SUBMISSION_STATUSES)[number];

/**
 * Phase KB-E: Update a single document checklist item.
 * All fields optional — caller specifies only what changes.
 */
export class UpdateDocumentChecklistDto {
  @IsOptional()
  @IsIn(DOCUMENT_SUBMISSION_STATUSES as unknown as string[])
  submission_status?: DocumentSubmissionStatus;

  @IsOptional()
  @IsString()
  review_notes?: string;

  @IsOptional()
  @IsDateString()
  expiry_date?: string;

  @IsOptional()
  @IsUUID()
  linked_document_id?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  current_version?: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}
