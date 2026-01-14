import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateTeamMemberDto {
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  responsibilities?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
