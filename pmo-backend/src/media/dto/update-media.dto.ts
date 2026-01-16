import { IsString, IsOptional, IsEnum } from 'class-validator';
import { MediaType } from '../../common/enums';

export class UpdateMediaDto {
  @IsOptional()
  @IsEnum(MediaType)
  media_type?: MediaType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  alt_text?: string;
}
