import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRepairTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
