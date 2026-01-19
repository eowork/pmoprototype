import { Module } from '@nestjs/common';
import { RepairTypesController } from './repair-types.controller';
import { RepairTypesService } from './repair-types.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [RepairTypesController],
  providers: [RepairTypesService],
  exports: [RepairTypesService],
})
export class RepairTypesModule {}
