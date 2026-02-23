import { PartialType } from '@nestjs/mapped-types';
import { CreateRepairProjectDto } from './create-repair-project.dto';
import { IsOptional, IsNumber, Min, Max, IsUUID } from 'class-validator';

export class UpdateRepairProjectDto extends PartialType(CreateRepairProjectDto) {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  physical_progress?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  financial_progress?: number;

  // Phase AF: Record-level delegation
  @IsOptional()
  @IsUUID()
  assigned_to?: string;
}
