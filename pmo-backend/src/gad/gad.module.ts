import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { GadController } from './gad.controller';
import { GadService } from './gad.service';
import {
  GadStudentParityData,
  GadFacultyParityData,
  GadStaffParityData,
  GadPwdParityData,
  GadIndigenousParityData,
  GadGpbAccomplishment,
  GadBudgetPlan,
} from '../database/entities';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      GadStudentParityData,
      GadFacultyParityData,
      GadStaffParityData,
      GadPwdParityData,
      GadIndigenousParityData,
      GadGpbAccomplishment,
      GadBudgetPlan,
    ]),
  ],
  controllers: [GadController],
  providers: [GadService],
  exports: [GadService],
})
export class GadModule {}
