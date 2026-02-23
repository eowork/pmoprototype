import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
  IsDateString,
  IsArray,
  Matches,
} from 'class-validator';
import { ProjectStatus, Campus } from '../../common/enums';

export class CreateConstructionProjectDto {
  @IsOptional()
  @IsUUID()
  project_id?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^CP-\d{4}-\d{3}$/, {
    message: 'Project code must follow format CP-YYYY-NNN (e.g., CP-2026-001)',
  })
  project_code: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  ideal_infrastructure_image?: string;

  @IsOptional()
  @IsString()
  beneficiaries?: string;

  @IsOptional()
  @IsArray()
  objectives?: string[];

  @IsOptional()
  @IsArray()
  key_features?: string[];

  @IsOptional()
  @IsString()
  original_contract_duration?: string;

  @IsOptional()
  @IsString()
  contract_number?: string;

  @IsOptional()
  @IsUUID()
  contractor_id?: string;

  @IsOptional()
  @IsNumber()
  contract_amount?: number;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  target_completion_date?: string;

  @IsOptional()
  @IsDateString()
  actual_completion_date?: string;

  @IsOptional()
  @IsString()
  project_duration?: string;

  @IsOptional()
  @IsString()
  project_engineer?: string;

  @IsOptional()
  @IsString()
  project_manager?: string;

  @IsOptional()
  @IsString()
  building_type?: string;

  @IsOptional()
  @IsNumber()
  floor_area?: number;

  @IsOptional()
  @IsNumber()
  number_of_floors?: number;

  @IsUUID()
  @IsNotEmpty()
  funding_source_id: string;

  @IsOptional()
  @IsUUID()
  subcategory_id?: string;

  @IsEnum(Campus)
  @IsNotEmpty()
  campus: Campus;

  @IsEnum(ProjectStatus)
  @IsNotEmpty()
  status: ProjectStatus;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  metadata?: Record<string, any>;

  // Phase AN: Inline assignment during creation (DEPRECATED - use assigned_user_ids)
  @IsOptional()
  @IsUUID()
  assigned_to?: string;

  // Phase AT: Multi-select assignment
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  assigned_user_ids?: string[];
}
