import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../common/dto';
import { MediaType } from '../../common/enums';

export class QueryMediaDto extends PaginationDto {
  @IsOptional()
  @IsString()
  mediable_type?: string;

  @IsOptional()
  @IsEnum(MediaType)
  media_type?: MediaType;

  @IsOptional()
  @IsString()
  title?: string;
}
