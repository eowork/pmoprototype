import { Module } from '@nestjs/common';
import { ConstructionProjectsController } from './construction-projects.controller';
import { ConstructionProjectsService } from './construction-projects.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ConstructionProjectsController],
  providers: [ConstructionProjectsService],
  exports: [ConstructionProjectsService],
})
export class ConstructionProjectsModule {}
