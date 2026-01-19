import { PartialType } from '@nestjs/mapped-types';
import { CreateFundingSourceDto } from './create-funding-source.dto';

export class UpdateFundingSourceDto extends PartialType(CreateFundingSourceDto) {}
