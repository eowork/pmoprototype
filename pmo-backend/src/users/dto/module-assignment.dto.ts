import { IsString, IsIn, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Module types matching database enum
export const MODULE_TYPES = [
  'CONSTRUCTION',
  'REPAIR',
  'OPERATIONS',
  'ALL',
] as const;
export type ModuleType = (typeof MODULE_TYPES)[number];

export class AssignModuleDto {
  @ApiProperty({
    description: 'Module type to assign',
    enum: MODULE_TYPES,
    example: 'CONSTRUCTION',
  })
  @IsString()
  @IsIn(MODULE_TYPES)
  module: ModuleType;
}

export class BulkModuleAssignmentDto {
  @ApiProperty({
    description:
      'List of modules to assign (replaces all existing assignments)',
    type: [String],
    enum: MODULE_TYPES,
    example: ['CONSTRUCTION', 'REPAIR'],
  })
  @IsArray()
  @IsString({ each: true })
  modules: ModuleType[];
}

export class ModuleAssignmentResponseDto {
  @ApiProperty({ description: 'Assignment ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  user_id: string;

  @ApiProperty({ description: 'Module type', enum: MODULE_TYPES })
  module: ModuleType;

  @ApiProperty({ description: 'Who assigned this module' })
  assigned_by: string | null;

  @ApiProperty({ description: 'When the module was assigned' })
  assigned_at: string;
}
