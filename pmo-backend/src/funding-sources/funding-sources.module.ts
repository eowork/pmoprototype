import { Module } from '@nestjs/common';
import { FundingSourcesController } from './funding-sources.controller';
import { FundingSourcesService } from './funding-sources.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [FundingSourcesController],
  providers: [FundingSourcesService],
  exports: [FundingSourcesService],
})
export class FundingSourcesModule {}
