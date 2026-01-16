import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { ProjectType, ProjectStatus, Campus } from '../../common/enums';

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
