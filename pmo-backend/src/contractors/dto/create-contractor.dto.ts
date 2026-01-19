import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ContractorStatus } from '../../common/enums';

export class CreateContractorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  contact_person?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  tin_number?: string;

  @IsString()
  @IsOptional()
  registration_number?: string;

  @IsDateString()
  @IsOptional()
  validity_date?: string;

  @IsEnum(ContractorStatus)
  @IsNotEmpty()
  status: ContractorStatus;

  @IsOptional()
  metadata?: Record<string, any>;
}
