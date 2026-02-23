import { IsString, IsBoolean, IsIn, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Module keys that can have permission overrides
export const VALID_MODULE_KEYS = [
  'coi',
  'repairs',
  'contractors',
  'funding_sources',
  'university_operations',
  'users',
] as const;

export type ModuleKey = typeof VALID_MODULE_KEYS[number];

export class SetPermissionOverrideDto {
  @ApiProperty({
    description: 'Module identifier',
    enum: VALID_MODULE_KEYS,
    example: 'coi',
  })
  @IsString()
  @IsIn(VALID_MODULE_KEYS)
  module_key: ModuleKey;

  @ApiProperty({
    description: 'Whether user can access this module',
    example: true,
  })
  @IsBoolean()
  can_access: boolean;
}

export interface PermissionOverride {
  id: string;
  user_id: string;
  module_key: ModuleKey;
  can_access: boolean;
  created_at: Date;
  updated_at: Date;
}

// Individual update item for bulk operations
export class BulkPermissionUpdateItem {
  @ApiProperty({
    description: 'Module identifier',
    enum: VALID_MODULE_KEYS,
    example: 'coi',
  })
  @IsString()
  @IsIn(VALID_MODULE_KEYS)
  module_key: ModuleKey;

  @ApiProperty({
    description: 'Access permission: true=grant, false=revoke, null=remove override (use role default)',
    example: true,
    nullable: true,
  })
  @IsOptional()
  @IsBoolean()
  can_access: boolean | null;
}

// Bulk permission update DTO
export class BulkPermissionUpdateDto {
  @ApiProperty({
    description: 'Array of permission updates to apply atomically',
    type: [BulkPermissionUpdateItem],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkPermissionUpdateItem)
  updates: BulkPermissionUpdateItem[];
}

export interface BulkPermissionResult {
  success: boolean;
  updated: number;
  deleted: number;
}
