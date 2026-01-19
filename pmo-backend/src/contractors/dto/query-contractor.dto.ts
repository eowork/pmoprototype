import { IsOptional, IsEnum, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto';
import { ContractorStatus } from '../../common/enums';

export class QueryContractorDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ContractorStatus)
  status?: ContractorStatus;

  @IsOptional()
  @IsString()
  name?: string;
}
