import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsUUID,
  IsDateString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export const MOV_RELATED_ENTITY_TYPES = [
  'MILESTONE',
  'TIMELINE_ENTRY',
] as const;
export type MovRelatedEntityType = (typeof MOV_RELATED_ENTITY_TYPES)[number];

export const MOV_EVIDENCE_CATEGORIES = [
  'photo_documentation',
  'inspection_report',
  'completion_certificate',
  'site_visit',
  'progress_report',
  'test_result',
  'meeting_minutes',
  'official_document',
  'other',
] as const;
export type MovEvidenceCategory = (typeof MOV_EVIDENCE_CATEGORIES)[number];

export class CreateMovEntryDto {
  @IsIn(MOV_RELATED_ENTITY_TYPES as unknown as string[])
  related_entity_type!: MovRelatedEntityType;

  @IsUUID()
  related_entity_id!: string;

  // LC-C: mov_link is now optional — entry may use file upload instead
  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true })
  mov_link?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  mov_title!: string;

  @IsOptional()
  @IsString()
  mov_description?: string;

  @IsOptional()
  @IsIn(MOV_EVIDENCE_CATEGORIES as unknown as string[])
  evidence_category?: MovEvidenceCategory;

  @IsOptional()
  @IsDateString()
  entry_date?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
