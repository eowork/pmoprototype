import { PartialType } from '@nestjs/mapped-types';
import { CreateConstructionProjectDto } from './create-construction-project.dto';

export class UpdateConstructionProjectDto extends PartialType(CreateConstructionProjectDto) {}
