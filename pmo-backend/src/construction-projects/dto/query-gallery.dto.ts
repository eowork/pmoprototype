import { IsOptional, IsEnum } from 'class-validator';
import { PaginationDto } from '../../common/dto';
import { GalleryCategory } from '../../common/enums';

export class QueryGalleryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(GalleryCategory)
  category?: GalleryCategory;
}
