import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
  IsEnum,
} from 'class-validator';

export enum IndicatorStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

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
