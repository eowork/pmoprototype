export interface ProjectItem {
  id: string;
  description: string;
  progress: number;
  quantity: number;
  unit: string;
  estimatedMaterialCost: number;
  estimatedLaborCost: number;
  estimatedProjectCost: number;
  unitCost: number;
  variance: number;
  startDate: string;
  endDate: string;
  projectDuration: number;
  status: string;
  category: string;
  // New M&E related fields
  meLogEntries?: Array<{
    date: string;
    progress: number;
    notes: string;
  }>;
  lastUpdated?: string;
}

export interface FinancialAllocation {
  totalBudget: number;
  physicalAccomplishmentValue: number;
  physicalAccomplishmentPercent: number;
  budgetUtilization: number;
  totalEstimatedCost: number;
  remainingBudget: number;
  costVariance: number;
}

export interface GalleryItem {
  id: string;
  filename: string;
  url: string;
  title: string;
  description?: string;
  uploadDate: string;
  uploadedBy: string;
  category: 'progress' | 'completed' | 'planning';
  // New M&E related fields
  associatedPeriod?: string;
  meRelevant?: boolean;
}

export interface DocumentItem {
  id: string;
  filename: string;
  fileType: string;
  fileSize: string;
  url: string;
  remarks: string;
  dateUploaded: string;
  uploadedBy: string;
  // New M&E related fields
  documentCategory?: 'report' | 'form' | 'assessment' | 'other';
  relatedPeriod?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar?: string;
  // New M&E related fields
  assignmentPeriod?: string;
  isActive?: boolean;
}

export interface SectionAData {
  projectDescription: string;
  idealInfrastructureImage: string;
  accomplishmentAsOf: string;
  dateEntry: string;
  comments: string;
  remarks: string;
}

export interface SectionBData {
  actualAccomplishmentAsOf: string;
  actualDateEntry: string;
  progressAccomplishmentPercent: number;
  projectStatusActual: number;
  projectStatusTarget: number;
  dateStarted: string;
  targetDateCompletion: string;
  originalContractDuration: string;
  contractorName: string;
}

export interface FormStates {
  isEditingOverview: boolean;
  isEditingSectionA: boolean;
  isEditingSectionB: boolean;
  isEditingFinancial: boolean;
  isProjectItemDialogOpen: boolean;
  isGalleryDialogOpen: boolean;
  isDocumentDialogOpen: boolean;
  isTeamDialogOpen: boolean;
  isFullScreenImageOpen: boolean;
}

export interface DialogFormData {
  projectItem: Partial<ProjectItem>;
  financial: Partial<FinancialAllocation>;
  gallery: {
    file: File | null;
    title: string;
    description: string;
    category: 'progress' | 'completed' | 'planning';
  };
  document: {
    file: File | null;
    remarks: string;
  };
  team: {
    name: string;
    role: string;
    department: string;
    avatar: string;
  };
}

export interface SelectedItems {
  projectItem: ProjectItem | null;
  image: GalleryItem | null;
  teamMember: TeamMember | null;
}