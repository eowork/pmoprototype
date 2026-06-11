import { IsOptional, IsEnum, IsUUID, IsIn, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto';
import {
  ProjectStatus,
  Campus,
  PRIMARY_FUNDING_SOURCE_VALUES,
} from '../../common/enums';

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

  // AAAK: Two-Level Funding — primary controlled-category filter (exact match).
  @IsOptional()
  @IsIn(PRIMARY_FUNDING_SOURCE_VALUES)
  primary_funding_source?: string;

  // AAAK: Two-Level Funding — free-text description filter (partial/ILIKE match).
  @IsOptional()
  @IsString()
  funding_source_description?: string;
}
