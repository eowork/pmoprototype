import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConstructionSubcategoriesController } from './construction-subcategories.controller';
import { ConstructionSubcategoriesService } from './construction-subcategories.service';
import { ConstructionSubcategory } from '../database/entities';

@Module({
  imports: [MikroOrmModule.forFeature([ConstructionSubcategory])],
  controllers: [ConstructionSubcategoriesController],
  providers: [ConstructionSubcategoriesService],
  exports: [ConstructionSubcategoriesService],
})
export class ConstructionSubcategoriesModule {}
