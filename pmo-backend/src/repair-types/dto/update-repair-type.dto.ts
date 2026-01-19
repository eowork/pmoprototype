import { PartialType } from '@nestjs/mapped-types';
import { CreateRepairTypeDto } from './create-repair-type.dto';

export class UpdateRepairTypeDto extends PartialType(CreateRepairTypeDto) {}
