import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { RepairProjectsController } from './repair-projects.controller';
import { RepairProjectsService } from './repair-projects.service';
import {
  RepairProject,
  RepairPowItem,
  RepairProjectPhase,
  RepairProjectTeamMember,
  RecordAssignment,
  Project,
} from '../database/entities';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      RepairProject,
      RepairPowItem,
      RepairProjectPhase,
      RepairProjectTeamMember,
      RecordAssignment,
      Project,
    ]),
  ],
  controllers: [RepairProjectsController],
  providers: [RepairProjectsService],
  exports: [RepairProjectsService],
})
export class RepairProjectsModule {}
