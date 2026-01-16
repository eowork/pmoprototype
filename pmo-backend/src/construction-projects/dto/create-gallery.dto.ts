import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { GalleryCategory } from '../../common/enums';

export class CreateGalleryDto {
  @IsEnum(GalleryCategory)
  category: GalleryCategory;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  captured_at?: string;
}
