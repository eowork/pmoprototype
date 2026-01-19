import { PartialType } from '@nestjs/mapped-types';
import { CreateConstructionSubcategoryDto } from './create-construction-subcategory.dto';

export class UpdateConstructionSubcategoryDto extends PartialType(CreateConstructionSubcategoryDto) {}
