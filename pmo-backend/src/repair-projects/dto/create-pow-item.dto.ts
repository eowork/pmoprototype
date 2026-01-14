import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreatePowItemDto {
  @IsString()
  @IsNotEmpty()
  item_number: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  unit: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  estimated_material_cost: number;

  @IsNumber()
  @IsNotEmpty()
  estimated_labor_cost: number;

  @IsNumber()
  @IsNotEmpty()
  estimated_project_cost: number;

  @IsNumber()
  @IsNotEmpty()
  unit_cost: number;

  @IsDateString()
  @IsNotEmpty()
  date_entry: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  phase: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
