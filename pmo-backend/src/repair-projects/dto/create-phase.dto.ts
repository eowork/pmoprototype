import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreatePhaseDto {
  @IsString()
  @IsNotEmpty()
  phase_name: string;

  @IsOptional()
  @IsString()
  phase_description?: string;

  @IsOptional()
  @IsNumber()
  target_progress?: number;

  @IsOptional()
  @IsNumber()
  actual_progress?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  target_start_date?: string;

  @IsOptional()
  @IsDateString()
  target_end_date?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
