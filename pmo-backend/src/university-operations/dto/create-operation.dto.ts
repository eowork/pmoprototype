import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
  IsDateString,
} from 'class-validator';

export enum OperationType {
  INSTRUCTION = 'INSTRUCTION',
  RESEARCH = 'RESEARCH',
  EXTENSION = 'EXTENSION',
  PRODUCTION = 'PRODUCTION',
  ADMINISTRATIVE = 'ADMINISTRATIVE',
}

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
}
