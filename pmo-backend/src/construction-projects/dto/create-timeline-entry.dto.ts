import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsIn,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';

export const TIMELINE_ENTRY_TYPES = [
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'QUARTERLY',
] as const;
export type TimelineEntryType = (typeof TIMELINE_ENTRY_TYPES)[number];

export class CreateTimelineEntryDto {
  @IsOptional()
  @IsIn(TIMELINE_ENTRY_TYPES as unknown as string[])
  entry_type?: TimelineEntryType;

  @IsDateString()
  entry_date!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  period_label?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  weather?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  manpower_count?: number;

  @IsOptional()
  @IsString()
  equipment_used?: string;

  @IsOptional()
  @IsString()
  work_accomplished?: string;

  @IsOptional()
  @IsString()
  issues_encountered?: string;

  // LC-D: who filed this entry
  @IsOptional()
  @IsIn(['CONSTRUCTOR', 'EVALUATOR', 'INSPECTOR', 'ADMIN'])
  reporter_type?: string;
}
