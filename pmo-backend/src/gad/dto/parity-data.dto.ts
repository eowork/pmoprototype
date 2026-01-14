import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum, Min } from 'class-validator';

export enum ParityStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class CreateStudentParityDto {
  @IsString() @IsNotEmpty() academic_year: string;
  @IsString() @IsNotEmpty() program: string;
  @IsOptional() @IsInt() @Min(0) admission_male?: number;
  @IsOptional() @IsInt() @Min(0) admission_female?: number;
  @IsOptional() @IsInt() @Min(0) graduation_male?: number;
  @IsOptional() @IsInt() @Min(0) graduation_female?: number;
}

export class CreateFacultyParityDto {
  @IsString() @IsNotEmpty() academic_year: string;
  @IsString() @IsNotEmpty() college: string;
  @IsString() @IsNotEmpty() category: string;
  @IsOptional() @IsInt() @Min(0) total_faculty?: number;
  @IsOptional() @IsInt() @Min(0) male_count?: number;
  @IsOptional() @IsInt() @Min(0) female_count?: number;
  @IsOptional() @IsString() gender_balance?: string;
}

export class CreateStaffParityDto {
  @IsString() @IsNotEmpty() academic_year: string;
  @IsString() @IsNotEmpty() department: string;
  @IsString() @IsNotEmpty() staff_category: string;
  @IsOptional() @IsInt() @Min(0) total_staff?: number;
  @IsOptional() @IsInt() @Min(0) male_count?: number;
  @IsOptional() @IsInt() @Min(0) female_count?: number;
  @IsOptional() @IsString() gender_balance?: string;
}

export class CreatePwdParityDto {
  @IsString() @IsNotEmpty() academic_year: string;
  @IsString() @IsNotEmpty() pwd_category: string;
  @IsOptional() @IsString() subcategory?: string;
  @IsOptional() @IsInt() @Min(0) total_beneficiaries?: number;
  @IsOptional() @IsInt() @Min(0) male_count?: number;
  @IsOptional() @IsInt() @Min(0) female_count?: number;
}

export class CreateIndigenousParityDto {
  @IsString() @IsNotEmpty() academic_year: string;
  @IsString() @IsNotEmpty() indigenous_category: string;
  @IsOptional() @IsString() subcategory?: string;
  @IsOptional() @IsInt() @Min(0) total_participants?: number;
  @IsOptional() @IsInt() @Min(0) male_count?: number;
  @IsOptional() @IsInt() @Min(0) female_count?: number;
}

export class ReviewParityDto {
  @IsEnum(ParityStatus) @IsNotEmpty() status: ParityStatus;
}
