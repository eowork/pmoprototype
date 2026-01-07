// Unified Project Types for Construction Infrastructure

export type ProjectStatus = 'Planning' | 'Ongoing' | 'Completed' | 'Delayed' | 'Suspended' | 'On Hold';
export type ProjectCategory = 'gaa-funded' | 'locally-funded' | 'special-grants';
export type GrantType = 'Special Grant' | 'Partnership' | 'Income-Generating';

/**
 * Unified project interface that supports all funding types
 * Includes fields from GAA-Funded, Locally-Funded, and Special Grants
 */
export interface ConstructionProject {
  // Core fields (required for all types)
  id: string;
  projectTitle: string;
  dateStarted: string;
  fundingSource: string;
  approvedBudget: number;
  appropriation: number;
  obligation: number;
  status: ProjectStatus;
  remarks: string;
  category: string;

  // Optional common fields
  projectDuration?: string;
  targetDateCompletion?: string;
  totalLaborCost?: number;
  totalProjectCost?: number;
  disbursement?: number;
  progressAccomplishment?: number;
  projectDescription?: string;
  originalContractDuration?: string;
  actualProgress?: number;
  targetProgress?: number;
  contractorName?: string;
  contractor?: string;
  location?: string;
  accomplishmentAsOf?: string;
  accomplishmentDateEntry?: string;
  accomplishmentComments?: string;
  accomplishmentRemarks?: string;
  actualAccomplishmentAsOf?: string;
  actualDateEntry?: string;
  projectStatus?: string;
  idealProposedImage?: string;
  description?: string;

  // Locally-Funded specific fields
  localGovernmentUnit?: string;
  projectManager?: string;

  // Special Grants specific fields
  grantType?: GrantType;
  partnerOrganization?: string;
  expectedRevenue?: number;
}

export interface ProjectPageConfig {
  category: ProjectCategory;
  title: string;
  subtitle: string;
  icon: any; // LucideIcon type
  defaultFundingSource: string;
  sampleProjects: ConstructionProject[];
}
