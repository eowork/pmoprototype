import { Module } from '@nestjs/common';
import { ConstructionSubcategoriesController } from './construction-subcategories.controller';
import { ConstructionSubcategoriesService } from './construction-subcategories.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ConstructionSubcategoriesController],
  providers: [ConstructionSubcategoriesService],
  exports: [ConstructionSubcategoriesService],
})
export class ConstructionSubcategoriesModule {}
