import { Module } from '@nestjs/common';
import { GadController } from './gad.controller';
import { GadService } from './gad.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [GadController],
  providers: [GadService],
  exports: [GadService],
})
export class GadModule {}
