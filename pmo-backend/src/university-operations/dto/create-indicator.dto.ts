import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
  IsEnum,
  IsUUID,
  IsIn,
  Min,
  Max,
} from 'class-validator';

export enum IndicatorStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/**
 * Phase CT: DTO for quarterly data entry only (fixed taxonomy model)
 *
 * This DTO enforces the pillar-based model where indicators are FIXED
 * (seeded in pillar_indicator_taxonomy) and users can ONLY enter quarterly values.
 *
 * NOT ALLOWED in this DTO:
 * - particular (from taxonomy)
 * - indicator_code (from taxonomy)
 * - uacs_code (from taxonomy)
 * - variance (computed server-side)
 * - average_target (computed server-side)
 * - average_accomplishment (computed server-side)
 */
export class CreateIndicatorQuarterlyDto {
  @IsUUID()
  @IsNotEmpty()
  pillar_indicator_id: string; // FK to pillar_indicator_taxonomy

  @IsInt()
  @Min(2020)
  @Max(2099)
  fiscal_year: number;

  // Phase DY-B: Identifies which quarterly snapshot this record belongs to
  @IsOptional()
  @IsIn(['Q1', 'Q2', 'Q3', 'Q4'])
  reported_quarter?: string;

  // Quarterly targets (nullable, supports % and counts)
  // Phase DU-B: Reasonable upper bounds to prevent typos and unrealistic entries
  // Max 99,999,999 aligns with DECIMAL(12,4) database precision
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(99999999)
  target_q1?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(99999999)
  target_q2?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(99999999)
  target_q3?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(99999999)
  target_q4?: number | null;

  // Quarterly accomplishments
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(99999999)
  accomplishment_q1?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(99999999)
  accomplishment_q2?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(99999999)
  accomplishment_q3?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(99999999)
  accomplishment_q4?: number | null;

  // Quarterly scores (ratio strings like "148/200")
  @IsOptional()
  @IsString()
  score_q1?: string;

  @IsOptional()
  @IsString()
  score_q2?: string;

  @IsOptional()
  @IsString()
  score_q3?: string;

  @IsOptional()
  @IsString()
  score_q4?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

/**
 * DEPRECATED: Legacy DTO for dynamic indicator CRUD
 *
 * This DTO allowed free-form indicator creation which violates BAR1 compliance.
 * Use CreateIndicatorQuarterlyDto instead.
 *
 * Will be removed after frontend refactor complete.
 */

export class CreateIndicatorDto {
  @IsString()
  @IsNotEmpty()
  particular: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  indicator_code?: string;

  @IsOptional()
  @IsString()
  uacs_code?: string;

  @IsInt()
  @IsNotEmpty()
  fiscal_year: number;

  @IsOptional()
  @IsNumber()
  target_q1?: number;

  @IsOptional()
  @IsNumber()
  target_q2?: number;

  @IsOptional()
  @IsNumber()
  target_q3?: number;

  @IsOptional()
  @IsNumber()
  target_q4?: number;

  @IsOptional()
  @IsNumber()
  accomplishment_q1?: number;

  @IsOptional()
  @IsNumber()
  accomplishment_q2?: number;

  @IsOptional()
  @IsNumber()
  accomplishment_q3?: number;

  @IsOptional()
  @IsNumber()
  accomplishment_q4?: number;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
