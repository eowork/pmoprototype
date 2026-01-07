// Core data interfaces for GAD Parity & Knowledge Management
export interface CollegeData {
  id: string;
  college: string;
  male: number;
  female: number;
  parityScore: number;
  status: string;
  year: number;
  lastUpdated: string;
  description?: string;
}

export interface GPBAccomplishment {
  id: string;
  title: string;
  description: string;
  status: 'Completed' | 'Ongoing' | 'Planned';
  targetBeneficiaries: number;
  actualBeneficiaries: number;
  targetBudget: number;
  actualBudget: number;
  targetPercentage: number;
  actualPercentage: number;
  completionDate: string;
  responsible: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  achievementRate: number;
  year: number;
  lastUpdated: string;
}

export interface BudgetPlan {
  id: string;
  title: string;
  category: string;
  budgetAllocated: number;
  budgetUtilized: number;
  targetBeneficiaries: number;
  actualBeneficiaries: number;
  targetPercentage: number;
  actualPercentage: number;
  status: 'planned' | 'ongoing' | 'completed';
  startDate: string;
  endDate: string;
  responsible: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
  year: number;
  lastUpdated: string;
}

export interface FileAttachment {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  uploadDate: string;
  uploader: string;
  description?: string;
  category: 'admission' | 'graduation' | 'gpb' | 'budget';
  year: number;
  downloadUrl: string;
}

export interface CalculationBasis {
  id: string;
  category: 'admission' | 'graduation';
  year: number;
  methodology: string;
  formula: string;
  assumptions: string[];
  dataSource: string;
  version: number;
  lastModified: string;
  modifiedBy: string;
  notes?: string;
}

export interface YearFilterOptions {
  selectedYear?: number;
  yearRange?: {
    startYear: number;
    endYear: number;
  };
  mode: 'single' | 'range';
}

export interface GeneralAnalysis {
  id: string;
  category: 'admission' | 'graduation' | 'gpb' | 'budget';
  year: number;
  title: string;
  content: string;
  lastModified: string;
  modifiedBy: string;
}

// Component Props Interfaces
export interface GADParityReportPageProps {
  category: string;
  onProjectSelect: (project: any) => void;
  userRole: string;
  filterData?: any;
  requireAuth: (action: string) => boolean;
  onClearFilters: () => void;
}

export interface YearFilterProps {
  selectedYear: number;
  availableYears: number[];
  onYearChange: (year: number) => void;
  mode?: 'single' | 'range';
  startYear?: number;
  endYear?: number;
  onRangeChange?: (startYear: number, endYear: number) => void;
}

export interface ResizableTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  autoSave?: boolean;
  autoSaveDelay?: number;
  maxLength?: number;
  required?: boolean;
}

export interface FileAttachmentManagerProps {
  files: FileAttachment[];
  onUpload: (files: File[], description?: string) => void;
  onDelete: (fileId: string) => void;
  onDownload: (file: FileAttachment) => void;
  category: 'admission' | 'graduation' | 'gpb' | 'budget';
  year: number;
  maxFileSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
}

export interface CalculationBasisManagerProps {
  entries: CalculationBasis[];
  onSave: (entry: Omit<CalculationBasis, 'id' | 'lastModified' | 'modifiedBy'>) => void;
  onEdit: (id: string, entry: Partial<CalculationBasis>) => void;
  onDelete: (id: string) => void;
  category: 'admission' | 'graduation';
  year: number;
}