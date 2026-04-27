import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { RepairTypesController } from './repair-types.controller';
import { RepairTypesService } from './repair-types.service';
import { RepairType } from '../database/entities';

@Module({
  imports: [MikroOrmModule.forFeature([RepairType])],
  controllers: [RepairTypesController],
  providers: [RepairTypesService],
  exports: [RepairTypesService],
})
export class RepairTypesModule {}
