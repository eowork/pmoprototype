import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { DatabaseModule } from '../database/database.module';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [DatabaseModule, UploadsModule],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
