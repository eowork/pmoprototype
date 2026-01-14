import { Module } from '@nestjs/common';
import { UniversityOperationsController } from './university-operations.controller';
import { UniversityOperationsService } from './university-operations.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UniversityOperationsController],
  providers: [UniversityOperationsService],
  exports: [UniversityOperationsService],
})
export class UniversityOperationsModule {}
