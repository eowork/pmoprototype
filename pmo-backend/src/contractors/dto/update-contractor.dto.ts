import { PartialType } from '@nestjs/mapped-types';
import { CreateContractorDto } from './create-contractor.dto';

export class UpdateContractorDto extends PartialType(CreateContractorDto) {}
