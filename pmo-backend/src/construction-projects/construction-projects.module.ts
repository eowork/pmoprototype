import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConstructionProjectsController } from './construction-projects.controller';
import { ConstructionProjectsService } from './construction-projects.service';
import { UploadsModule } from '../uploads/uploads.module';
import {
  ConstructionProject,
  ConstructionMilestone,
  ConstructionProjectFinancial,
  ConstructionGallery,
  RecordAssignment,
  Project,
} from '../database/entities';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      ConstructionProject,
      ConstructionMilestone,
      ConstructionProjectFinancial,
      ConstructionGallery,
      RecordAssignment,
      Project,
    ]),
    UploadsModule,
  ],
  controllers: [ConstructionProjectsController],
  providers: [ConstructionProjectsService],
  exports: [ConstructionProjectsService],
})
export class ConstructionProjectsModule {}
