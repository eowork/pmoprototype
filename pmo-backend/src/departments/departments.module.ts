import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { Department, UserDepartment } from '../database/entities';

@Module({
  imports: [MikroOrmModule.forFeature([Department, UserDepartment])],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}
