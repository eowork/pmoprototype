import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { SystemSetting } from '../database/entities';

@Module({
  imports: [MikroOrmModule.forFeature([SystemSetting])],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
