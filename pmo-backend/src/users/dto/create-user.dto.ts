import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Max,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase, one lowercase, and one number',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  first_name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  last_name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[a-z0-9._-]+$/, {
    message: 'Username must be lowercase and contain only letters, numbers, dots, underscores, or dashes',
  })
  username: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(100)
  rank_level?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  campus?: string;  // Phase Y: Office-scoped visibility

  @IsOptional()
  metadata?: Record<string, any>;
}
