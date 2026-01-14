import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
} from 'class-validator';

export enum ProjectType {
  CONSTRUCTION = 'CONSTRUCTION',
  REPAIR = 'REPAIR',
  MAINTENANCE = 'MAINTENANCE',
  RENOVATION = 'RENOVATION',
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

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  project_code: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ProjectType)
  @IsNotEmpty()
  project_type: ProjectType;

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
  metadata?: Record<string, any>;
}
