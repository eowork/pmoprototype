import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { SettingDataType } from '../../common/enums';

export class CreateSettingDto {
  @IsString()
  @IsNotEmpty()
  setting_key: string;

  @IsOptional()
  @IsString()
  setting_value?: string;

  @IsString()
  @IsNotEmpty()
  setting_group: string;

  @IsEnum(SettingDataType)
  @IsNotEmpty()
  data_type: SettingDataType;

  @IsOptional()
  @IsBoolean()
  is_public?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
