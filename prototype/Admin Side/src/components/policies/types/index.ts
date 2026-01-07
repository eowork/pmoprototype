// Enhanced Type definitions for Policies and agreements
export interface PolicyDocument {
  id: string;
  title: string;
  description: string;
  category: 'memorandum-of-agreements' | 'memorandum-of-understanding' | 'policy-document';
  documentType: 'MOA' | 'MOU' | 'Policy' | 'Guideline' | 'Manual';
  documentNumber: string;
  effectiveDate: string;
  expiryDate?: string;
  status: 'Draft' | 'Under Review' | 'Approved' | 'Active' | 'Expired' | 'Superseded' | 'Expiring Soon';
  approvedBy: string;
  department: string;
  stakeholders: string[];
  filePath: string;
  fileSize: string;
  version: string;
  lastReviewed: string;
  nextReviewDate: string;
  tags: string[];
  summary: string;
  relatedDocuments: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // Enhanced fields for comprehensive tracking
  parties: string[];
  signedDate: string;
  type: string;
  urgency: 'High' | 'Medium' | 'Normal';
  value?: string;
  scope?: string;
  keyBeneficiaries: number;
  responsible: string;
  attachments: number;
  comments: string;
  documentUrl: string;
  dateUploaded: string;
}

export interface PolicyMetrics {
  totalDocuments: number;
  activeDocuments: number;
  expiringSoon: number;
  expired: number;
  highUrgency: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  totalValue: number;
  totalBeneficiaries: number;
}

export interface PolicyOverviewProps {
  userRole: string;
  requireAuth: (action: string) => boolean;
  onNavigate: (page: string) => void;
}

export interface EnhancedPoliciesPageProps {
  category: string;
  userRole: string;
  requireAuth: (action: string) => boolean;
  onProjectSelect?: (project: any) => void;
  filterData?: any;
  onClearFilters?: () => void;
}