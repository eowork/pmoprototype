import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
  IsDateString,
  IsArray,
} from 'class-validator';

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED',
}

export enum Campus {
  MAIN = 'MAIN',
  BUTUAN = 'BUTUAN',
  CABADBARAN = 'CABADBARAN',
  SAN_FRANCISCO = 'SAN_FRANCISCO',
}

export class CreateConstructionProjectDto {
  @IsUUID()
  @IsNotEmpty()
  project_id: string;

  @IsString()
  @IsNotEmpty()
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
}
