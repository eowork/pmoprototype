import { IsInt, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateConstructionFinancialDto {
  @IsInt()
  @IsNotEmpty()
  fiscal_year: number;

  @IsNumber()
  @IsNotEmpty()
  appropriation: number;

  @IsNumber()
  @IsNotEmpty()
  obligation: number;

  @IsOptional()
  @IsNumber()
  disbursement?: number;

  @IsOptional()
  metadata?: Record<string, any>;
}
