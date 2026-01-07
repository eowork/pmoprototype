// Comprehensive Gender Parity Data Types

export type GenderParityCategory = 'students' | 'faculty' | 'staff' | 'pwd' | 'indigenous';
export type AcademicYear = string; // e.g., '2023-2024'
export type SchoolCategory = 'undergraduate' | 'professional';
export type DataStatus = 'pending' | 'approved' | 'rejected';
export type StaffCategory = 'administrative' | 'support';

// Student Gender Parity Data
export interface StudentParityData {
  id: string;
  academicYear: AcademicYear;
  program: string; // CAA, CED, CCIS, CMNS, CHASS, CEGS (6 undergraduate colleges)
  admissionMale: number;
  admissionFemale: number;
  graduationMale: number;
  graduationFemale: number;
  status: DataStatus;
  submittedBy?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Faculty Gender Parity Data
export interface FacultyParityData {
  id: string;
  academicYear: AcademicYear;
  college: string; // 6 Undergraduate: CAA, CED, CCIS, CMNS, CHASS, CEGS + 2 Professional: School of Medicine, Graduate School
  category: SchoolCategory;
  totalFaculty: number;
  maleCount: number;
  femaleCount: number;
  malePercentage: number;
  femalePercentage: number;
  genderBalance: 'Good' | 'Balanced' | 'Improving' | 'Needs Attention';
  status: DataStatus;
  submittedBy?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Staff Gender Parity Data
export interface StaffParityData {
  id: string;
  academicYear: AcademicYear;
  department: string;
  staffCategory: StaffCategory; // administrative or support
  totalStaff: number;
  maleCount: number;
  femaleCount: number;
  malePercentage: number;
  femalePercentage: number;
  genderBalance: 'Good' | 'Balanced' | 'Improving' | 'Needs Attention';
  status: DataStatus;
  submittedBy?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// PWD (Persons with Disability) Data
export interface PWDParityData {
  id: string;
  academicYear: AcademicYear;
  pwdCategory: 'population' | 'support'; // Population or Support Service
  subcategory: string; // For population: Students, Faculty, Staff, etc. For support: Accessibility Support, Scholarship, etc.
  totalBeneficiaries: number;
  maleCount: number;
  femaleCount: number;
  malePercentage: number;
  femalePercentage: number;
  status: DataStatus;
  submittedBy?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Indigenous People Data
export interface IndigenousParityData {
  id: string;
  academicYear: AcademicYear;
  indigenousCategory: 'community' | 'program'; // Community or Support Program
  subcategory: string; // For community: Students, Faculty, Staff, etc. For program: Scholarship, Cultural Programs, etc.
  totalParticipants: number;
  maleCount: number;
  femaleCount: number;
  malePercentage: number;
  femalePercentage: number;
  status: DataStatus;
  submittedBy?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Radar Chart Data Structure
export interface RadarChartData {
  program: string;
  malePercentage: number;
  femalePercentage: number;
}

// KPI Metrics
export interface GenderParityMetrics {
  admissionParityIndex: number;
  graduationParityIndex: number;
  yearOverYearImprovement: number;
  targetParityIndex: number;
}

// Faculty Distribution Summary
export interface FacultyDistributionSummary {
  college: string;
  category: SchoolCategory;
  totalFaculty: number;
  malePercentage: number;
  femalePercentage: number;
  genderBalance: 'Good' | 'Balanced' | 'Improving' | 'Needs Attention';
}

// Form data for CRUD operations
export type CreateStudentParityData = Omit<StudentParityData, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateStudentParityData = Partial<CreateStudentParityData>;

export type CreateFacultyParityData = Omit<FacultyParityData, 'id' | 'createdAt' | 'updatedAt' | 'malePercentage' | 'femalePercentage'>;
export type UpdateFacultyParityData = Partial<CreateFacultyParityData>;

export type CreateStaffParityData = Omit<StaffParityData, 'id' | 'createdAt' | 'updatedAt' | 'malePercentage' | 'femalePercentage'>;
export type UpdateStaffParityData = Partial<CreateStaffParityData>;

export type CreatePWDParityData = Omit<PWDParityData, 'id' | 'createdAt' | 'updatedAt' | 'malePercentage' | 'femalePercentage'>;
export type UpdatePWDParityData = Partial<CreatePWDParityData>;

export type CreateIndigenousParityData = Omit<IndigenousParityData, 'id' | 'createdAt' | 'updatedAt' | 'malePercentage' | 'femalePercentage'>;
export type UpdateIndigenousParityData = Partial<CreateIndigenousParityData>;

// Constants
export const UNDERGRADUATE_COLLEGES = [
  'CAA (College of Agriculture and Agri-Industries)',
  'CED (College of Education)',
  'CCIS (College of Computing and Information Sciences)',
  'CMNS (College of Mathematics and Natural Sciences)',
  'CHASS (College of Humanities, Arts and Social Sciences)',
  'CEGS (College of Engineering and Geo-Sciences)'
] as const;

export const PROFESSIONAL_SCHOOLS = [
  'School of Medicine',
  'Graduate School'
] as const;

export const COLLEGE_ABBREVIATIONS = {
  'CAA': 'CAA (College of Agriculture and Agri-Industries)',
  'CED': 'CED (College of Education)',
  'CCIS': 'CCIS (College of Computing and Information Sciences)',
  'CMNS': 'CMNS (College of Mathematics and Natural Sciences)',
  'CHASS': 'CHASS (College of Humanities, Arts and Social Sciences)',
  'CEGS': 'CEGS (College of Engineering and Geo-Sciences)',
  'SOM': 'School of Medicine',
  'GS': 'Graduate School'
} as const;
