import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateFundingSourceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
