import { IsOptional, IsEnum, IsUUID, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto';
import { OperationType, ProjectStatus, Campus } from './create-operation.dto';

export class QueryOperationDto extends PaginationDto {
  @IsOptional()
  @IsEnum(OperationType)
  type?: OperationType;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsEnum(Campus)
  campus?: Campus;

  @IsOptional()
  @IsUUID()
  coordinator_id?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  fiscal_year?: number;
}
