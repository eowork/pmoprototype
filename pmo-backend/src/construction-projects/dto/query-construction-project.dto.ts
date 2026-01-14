import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { PaginationDto } from '../../common/dto';
import { ProjectStatus, Campus } from './create-construction-project.dto';

export class QueryConstructionProjectDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsEnum(Campus)
  campus?: Campus;

  @IsOptional()
  @IsUUID()
  contractor_id?: string;

  @IsOptional()
  @IsUUID()
  funding_source_id?: string;
}
