import { PartialType } from '@nestjs/mapped-types';
import { CreateRepairProjectDto } from './create-repair-project.dto';

export class UpdateRepairProjectDto extends PartialType(CreateRepairProjectDto) {}
