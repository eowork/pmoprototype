import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { RepairStatus, UrgencyLevel, Campus } from '../../common/enums';

export class CreateRepairProjectDto {
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

  @IsString()
  @IsNotEmpty()
  building_name: string;

  @IsOptional()
  @IsString()
  floor_number?: string;

  @IsOptional()
  @IsString()
  room_number?: string;

  @IsOptional()
  @IsString()
  specific_location?: string;

  @IsUUID()
  @IsNotEmpty()
  repair_type_id: string;

  @IsEnum(UrgencyLevel)
  @IsNotEmpty()
  urgency_level: UrgencyLevel;

  @IsOptional()
  @IsBoolean()
  is_emergency?: boolean;

  @IsEnum(Campus)
  @IsNotEmpty()
  campus: Campus;

  @IsOptional()
  @IsString()
  reported_by?: string;

  @IsOptional()
  @IsDateString()
  inspection_date?: string;

  @IsOptional()
  @IsUUID()
  inspector_id?: string;

  @IsOptional()
  @IsString()
  inspection_findings?: string;

  @IsEnum(RepairStatus)
  @IsNotEmpty()
  status: RepairStatus;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsUUID()
  project_manager_id?: string;

  @IsOptional()
  @IsUUID()
  contractor_id?: string;

  @IsOptional()
  @IsUUID()
  facility_id?: string;

  @IsOptional()
  @IsString()
  assigned_technician?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
