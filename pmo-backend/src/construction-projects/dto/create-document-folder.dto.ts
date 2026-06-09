import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

const FOLDER_NODE_TYPES = ['CONTAINER', 'TEMPLATE', 'SUBMISSIONS'] as const;

export class CreateDocumentFolderDto {
  @IsString()
  @MaxLength(200)
  folder_name!: string;

  @IsOptional()
  @IsUUID()
  parent_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  group_code?: string;

  @IsOptional()
  @IsIn(FOLDER_NODE_TYPES as unknown as string[])
  node_type?: (typeof FOLDER_NODE_TYPES)[number];

  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;
}
