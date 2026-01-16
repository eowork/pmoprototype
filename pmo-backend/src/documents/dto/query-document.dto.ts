import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../common/dto';
import { DocumentType } from '../../common/enums';

export class QueryDocumentDto extends PaginationDto {
  @IsOptional()
  @IsString()
  documentable_type?: string;

  @IsOptional()
  @IsEnum(DocumentType)
  document_type?: DocumentType;

  @IsOptional()
  @IsString()
  category?: string;
}
