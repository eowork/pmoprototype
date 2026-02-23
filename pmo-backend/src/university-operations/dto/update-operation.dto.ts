import { PartialType } from '@nestjs/mapped-types';
import { CreateOperationDto } from './create-operation.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateOperationDto extends PartialType(CreateOperationDto) {
  // Phase AF: Record-level delegation
  @IsOptional()
  @IsUUID()
  assigned_to?: string;
}
