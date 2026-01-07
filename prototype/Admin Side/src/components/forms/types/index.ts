// Type definitions for Forms and documents
export interface FormDocument {
  id: string;
  title: string;
  description: string;
  category: 'GAD Reporting' | 'Project Monitoring' | 'Progress Reporting' | 
           'Evaluation' | 'Monitoring' | 'M&E Framework' | 'Other';
  formType: 'HGDG-16 Sectoral Forms' | 'PIMME Checklist' | 'PMO Monthly Accomplishment Form' | 
           'Evaluation Plan' | 'Monitoring Plan' | 'CSU M&E Plan' | 'Other';
  version: string;
  lastUpdated: string;
  department: string;
  office: string;
  purpose: string;
  instructions: string;
  remarks?: string;
  filePath: string;
  fileName: string;
  fileSize: string;
  downloadCount: number;
  isActive: boolean;
  requiredBy: string[];
  relatedForms: string[];
  validityPeriod?: string;
  uploadedBy: string;
  uploadedDate: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface FormsMetrics {
  totalForms: number;
  activeForms: number;
  totalDownloads: number;
  byCategory: Record<string, number>;
  byFormType: Record<string, number>;
  byDepartment: Record<string, number>;
  byOffice: Record<string, number>;
  popularForms: FormDocument[];
  recentlyUpdated: FormDocument[];
}

export interface FormFilter {
  search?: string;
  category?: string;
  formType?: string;
  department?: string;
  office?: string;
  timeRange?: 'all' | 'week' | 'month' | 'quarter' | 'year';
  sortBy?: 'name' | 'date' | 'downloads' | 'department';
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

export interface ViewType {
  value: 'table' | 'list' | 'card';
  label: string;
  icon: any;
}

// Form categories that were removed from sidebar
export const LEGACY_FORM_TYPES = [
  'HGDG-16 Sectoral Forms',
  'PIMME Checklist', 
  'PMO Monthly Accomplishment Form',
  'Evaluation Plan',
  'Monitoring Plan',
  'CSU M&E Plan'
] as const;

export const FORM_CATEGORIES = [
  'All Categories',
  'GAD Reporting',
  'Project Monitoring', 
  'Progress Reporting',
  'Evaluation',
  'Monitoring',
  'M&E Framework',
  'Other'
] as const;

export const DEPARTMENTS = [
  'All Departments',
  'Office of the President',
  'Vice President for Academic Affairs',
  'Vice President for Administration',
  'Planning and Development Office',
  'Project Management Office',
  'Finance Office',
  'Human Resource Office',
  'Registrar Office',
  'Research and Extension Office',
  'Other'
] as const;

export const OFFICES = [
  'All Offices',
  'Main Office',
  'Branch Office',
  'Satellite Office',
  'Department Office',
  'Other'
] as const;