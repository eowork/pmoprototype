import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto';

export class QueryFundingSourceDto extends PaginationDto {
  @IsOptional()
  @IsString()
  name?: string;
}
