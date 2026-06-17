import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

// Phase BZ: Allow email updates (remove from OmitType exclusion)
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password']),
) {
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase, one lowercase, and one number',
  })
  password?: string;

  // PHASE BBBG (Track 5): grouped-profile fields. middle_name is a column; office/position/suffix
  // are stored in metadata (no schema change) — merged in UsersService.update().
  @IsOptional()
  @IsString()
  @MaxLength(100)
  middle_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  suffix?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  office?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  position?: string;
}
