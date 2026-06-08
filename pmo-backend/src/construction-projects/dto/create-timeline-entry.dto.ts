import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

// ZZZ-G: structured Project Concern item (shared by WAR/MPR/timelogs)
export class ConcernItemDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string; // SAFETY | SCHEDULE | FINANCIAL | ENVIRONMENTAL | QUALITY | OTHER

  @IsOptional()
  @IsString()
  severity?: string; // CRITICAL | HIGH | MEDIUM | LOW

  @IsOptional()
  @IsString()
  status?: string; // OPEN | IN_PROGRESS | RESOLVED

  @IsOptional()
  @IsString()
  responsibleParty?: string;

  @IsOptional()
  @IsString()
  resolutionTargetDate?: string;

  @IsOptional()
  @IsString()
  actualResolutionDate?: string;

  @IsOptional()
  @IsString()
  mitigationAction?: string;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  createdAt?: string;
}

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

  // GGG-F: WAR fields
  @IsOptional()
  @IsString()
  @MaxLength(50)
  war_number?: string;

  @IsOptional()
  @IsDateString()
  reporting_period_start?: string;

  @IsOptional()
  @IsDateString()
  reporting_period_end?: string;

  @IsOptional()
  @IsString()
  personnel_equipment_constraints?: string;

  @IsOptional()
  @IsString()
  mitigation_measures?: string;

  @IsOptional()
  @IsString()
  look_ahead_activities?: string;

  @IsOptional()
  @IsArray()
  accomplishments?: Record<string, any>[];

  @IsOptional()
  @IsArray()
  signatories?: Record<string, any>[];

  // GGG-F: MPR fields
  @IsOptional()
  @IsString()
  @MaxLength(50)
  mpr_number?: string;

  @IsOptional()
  @IsDateString()
  reporting_period_month?: string;

  @IsOptional()
  @IsArray()
  work_items?: Record<string, any>[];

  @IsOptional()
  @IsNumber()
  accomplishment_summary_percent?: number;

  @IsOptional()
  @IsNumber()
  percent_time_elapsed?: number;

  @IsOptional()
  @IsNumber()
  original_contract_amount?: number;

  @IsOptional()
  @IsNumber()
  revised_contract_amount?: number;

  // BBB-C: WAR/MPR financial billing (operational; Progress Reports is the official record)
  @IsOptional()
  @IsNumber()
  billing_amount_this_period?: number;

  @IsOptional()
  @IsNumber()
  financial_accomplishment_percent?: number;

  // ZZZ-G: structured Project Concerns list (shared by WAR/MPR/timelogs)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConcernItemDto)
  concerns_list?: ConcernItemDto[];
}
