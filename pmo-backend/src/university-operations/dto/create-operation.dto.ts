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
import { OperationType, ProjectStatus, Campus } from '../../common/enums';

export class CreateOperationDto {
  @IsEnum(OperationType)
  @IsNotEmpty()
  operation_type: OperationType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsEnum(ProjectStatus)
  @IsNotEmpty()
  status: ProjectStatus;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsEnum(Campus)
  @IsNotEmpty()
  campus: Campus;

  @IsOptional()
  @IsUUID()
  coordinator_id?: string;

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
