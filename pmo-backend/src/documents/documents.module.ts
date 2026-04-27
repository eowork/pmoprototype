import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { UploadsModule } from '../uploads/uploads.module';
import { Document } from '../database/entities';

@Module({
  imports: [MikroOrmModule.forFeature([Document]), UploadsModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
