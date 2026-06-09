import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { UploadsModule } from '../uploads/uploads.module';
import { Media } from '../database/entities';

@Module({
  imports: [MikroOrmModule.forFeature([Media]), UploadsModule],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
