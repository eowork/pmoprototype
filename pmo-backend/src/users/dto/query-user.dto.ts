import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto';

export class QueryUserDto extends PaginationDto {
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  campus?: string;

  // PQ-D: filter by registration status (ACTIVE | PENDING | REJECTED)
  @IsOptional()
  @IsString()
  status?: string;

  // PJ-G: filter by user type from metadata (CSU_PERSONNEL | CONTRACTOR | CONSULTANT | EXTERNAL_PARTNER)
  @IsOptional()
  @IsString()
  user_type?: string;
}

export class QueryEligibleUsersDto {
  @IsString()
  module: string;

  @IsOptional()
  @IsString()
  campus?: string;
}
