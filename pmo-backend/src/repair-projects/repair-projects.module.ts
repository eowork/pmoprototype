import { Module } from '@nestjs/common';
import { RepairProjectsController } from './repair-projects.controller';
import { RepairProjectsService } from './repair-projects.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [RepairProjectsController],
  providers: [RepairProjectsService],
  exports: [RepairProjectsService],
})
export class RepairProjectsModule {}
