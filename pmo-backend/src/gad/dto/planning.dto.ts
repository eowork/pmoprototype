import { IsString, IsNotEmpty, IsOptional, IsInt, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateGpbAccomplishmentDto {
  @IsString() @IsNotEmpty() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsInt() @Min(0) target_beneficiaries?: number;
  @IsOptional() @IsInt() @Min(0) actual_beneficiaries?: number;
  @IsOptional() @IsNumber() target_budget?: number;
  @IsOptional() @IsNumber() actual_budget?: number;
  @IsOptional() @IsString() year?: string;
  @IsOptional() @IsString() responsible?: string;
}

export class CreateBudgetPlanDto {
  @IsString() @IsNotEmpty() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() priority?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsNumber() budget_allocated?: number;
  @IsOptional() @IsNumber() budget_utilized?: number;
  @IsOptional() @IsInt() @Min(0) target_beneficiaries?: number;
  @IsOptional() @IsDateString() start_date?: string;
  @IsOptional() @IsDateString() end_date?: string;
  @IsOptional() @IsString() year?: string;
  @IsOptional() @IsString() responsible?: string;
}
