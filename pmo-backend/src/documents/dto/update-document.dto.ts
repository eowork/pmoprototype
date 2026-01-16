import { IsString, IsOptional, IsEnum } from 'class-validator';
import { DocumentType } from '../../common/enums';

export class UpdateDocumentDto {
  @IsOptional()
  @IsEnum(DocumentType)
  document_type?: DocumentType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
