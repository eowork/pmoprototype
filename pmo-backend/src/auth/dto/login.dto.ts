import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  identifier: string; // Accepts email or username

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
