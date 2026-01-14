import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
  IsIn,
} from 'class-validator';

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
