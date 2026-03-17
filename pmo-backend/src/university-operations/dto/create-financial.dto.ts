import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
  IsIn,
  IsEnum,
  MaxLength,
} from 'class-validator';

// Phase BC: BAR1 fund type subcategories
export enum FundType {
  RAF_PROGRAMS = 'RAF_PROGRAMS',
  RAF_PROJECTS = 'RAF_PROJECTS',
  RAF_CONTINUING = 'RAF_CONTINUING',
  IGF_MAIN = 'IGF_MAIN',
  IGF_CABADBARAN = 'IGF_CABADBARAN',
}

/**
 * Phase CU: Financial data DTO (computed fields EXCLUDED)
 *
 * NEVER ADD the following fields to this DTO:
 * - utilization_per_target (computed: (obligation/target)*100)
 * - utilization_per_approved_budget (computed: (obligation/allotment)*100)
 * - disbursement_rate (computed: (disbursement/obligation)*100)
 * - balance (computed: allotment - obligation)
 * - variance (computed: obligation - target)
 *
 * These are calculated server-side in computeFinancialMetrics() and stored in DB.
 */
export class CreateFinancialDto {
  @IsInt()
  @IsNotEmpty()
  fiscal_year: number;

  @IsOptional()
  @IsIn(['Q1', 'Q2', 'Q3', 'Q4'])
  quarter?: string;

  @IsString()
  @IsNotEmpty()
  operations_programs: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  budget_source?: string;

  // Phase BC: BAR1 fund type subcategory
  @IsOptional()
  @IsEnum(FundType)
  fund_type?: FundType;

  // Phase BC: BAR1 project-level identifier
  @IsOptional()
  @IsString()
  @MaxLength(50)
  project_code?: string;

  @IsOptional()
  @IsNumber()
  allotment?: number;

  @IsOptional()
  @IsNumber()
  target?: number;

  @IsOptional()
  @IsNumber()
  obligation?: number;

  @IsOptional()
  @IsNumber()
  disbursement?: number;

  @IsOptional()
  @IsString()
  performance_indicator?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
