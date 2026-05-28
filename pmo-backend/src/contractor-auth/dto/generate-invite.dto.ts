import { IsEmail, IsInt, IsOptional, Max, Min } from 'class-validator';

export class GenerateInviteDto {
  @IsOptional()
  @IsEmail()
  targetEmail?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(168)
  ttlHours?: number = 72;
}
