import { IsOptional, IsEnum } from 'class-validator';
import { PaginationDto } from '../../common/dto';
import { ProjectType, ProjectStatus, Campus } from './create-project.dto';

export class QueryProjectDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ProjectType)
  type?: ProjectType;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsEnum(Campus)
  campus?: Campus;
}
