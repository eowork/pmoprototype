import { IsString, IsOptional, IsEnum } from 'class-validator';
import { MediaType } from '../../common/enums';

export class CreateMediaDto {
  @IsEnum(MediaType)
  media_type: MediaType;

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
