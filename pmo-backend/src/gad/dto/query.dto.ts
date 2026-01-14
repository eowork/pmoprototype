import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../common/dto';
import { ParityStatus } from './parity-data.dto';

export class QueryParityDto extends PaginationDto {
  @IsOptional() @IsString() academic_year?: string;
  @IsOptional() @IsEnum(ParityStatus) status?: ParityStatus;
}

export class QueryPlanningDto extends PaginationDto {
  @IsOptional() @IsString() year?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() status?: string;
}
