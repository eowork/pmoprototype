import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Matches,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { DocumentLifecycleStatus } from '../../common/enums';

export class UploadDocumentDto {
  @IsString()
  @MaxLength(50)
  documentType!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @Matches(/^https?:\/\/(drive|docs)\.google\.com\//i, {
    message: 'externalLink must be a valid Google Drive URL',
  })
  externalLink?: string;

  @IsOptional()
  @IsEnum(DocumentLifecycleStatus)
  lifecycleStatus?: DocumentLifecycleStatus;

  @IsOptional()
  @IsUUID()
  folder_id?: string;
}
