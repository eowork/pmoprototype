import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Phase CH: DTO for updating organizational information on a University Operation.
 * Used by PATCH /university-operations/:id/organizational-info
 *
 * Maps to operation_organizational_info table columns:
 * - department VARCHAR(255)
 * - agency_entity VARCHAR(255)
 * - operating_unit VARCHAR(255)
 * - organization_code VARCHAR(50)
 */
export class UpdateOrganizationalInfoDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  department?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  agency_entity?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  operating_unit?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  organization_code?: string;
}
