import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { SettingDataType } from '../../common/enums';

export class UpdateSettingDto {
  @IsOptional()
  @IsString()
  setting_value?: string;

  @IsOptional()
  @IsString()
  setting_group?: string;

  @IsOptional()
  @IsEnum(SettingDataType)
  data_type?: SettingDataType;

  @IsOptional()
  @IsBoolean()
  is_public?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
