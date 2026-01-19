import { IsUUID, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class AssignUserDto {
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @IsOptional()
  @IsBoolean()
  is_primary?: boolean;
}
