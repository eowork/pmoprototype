import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateFundingSourceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  // MD: classification — 'INTERNAL' | 'EXTERNAL' | 'CUSTOM'
  @IsString()
  @IsOptional()
  type?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
