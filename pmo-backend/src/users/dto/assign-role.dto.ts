import { IsUUID, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class AssignRoleDto {
  @IsUUID()
  @IsNotEmpty()
  role_id: string;

  @IsOptional()
  @IsBoolean()
  is_superadmin?: boolean;
}

export class RemoveRoleDto {
  @IsUUID()
  @IsNotEmpty()
  role_id: string;
}
