import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project } from '../database/entities';

@Module({
  imports: [MikroOrmModule.forFeature([Project])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
