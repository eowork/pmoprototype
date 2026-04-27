import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { FundingSourcesController } from './funding-sources.controller';
import { FundingSourcesService } from './funding-sources.service';
import { FundingSource } from '../database/entities';

@Module({
  imports: [MikroOrmModule.forFeature([FundingSource])],
  controllers: [FundingSourcesController],
  providers: [FundingSourcesService],
  exports: [FundingSourcesService],
})
export class FundingSourcesModule {}
