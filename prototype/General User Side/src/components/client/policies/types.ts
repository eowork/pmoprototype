// Type definitions for the client policies component - simplified for MOA/MOU focus

export interface PolicyDocument {
  id: string;
  title: string;
  description: string;
  type: 'MOA' | 'MOU' | 'Policy' | 'Agreement';
  status: 'Active' | 'Under Review' | 'Approved' | 'Expired' | 'Draft';
  dateCreated: string;
  lastUpdated: string;
  entity: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  attachments: {
    count: number;
    hasSignedCopy: boolean;
    types: string[];
  };
  tags: string[];
  downloadUrl?: string;
  previewUrl?: string;
  effectiveDate?: string;
  expiryDate?: string;
  signatories?: string[];
}

export interface PolicyStatistics {
  totalDocuments: number;
  activeDocuments: number;
  moaCount: number;
  mouCount: number;
  policyCount: number;
  agreementCount: number;
  recentUpdates: number;
  upcomingExpirations: number;
  highPriorityCount: number;
  categoriesCount: number;
}

export interface FilterOptions {
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
  priorityFilter: string;
  categoryFilter: string;
}

export interface NavigationSection {
  id: string;
  label: string;
  icon: any; // React component
}

export interface ClientPoliciesPageProps {
  currentSection?: string;
  onNavigate: (page: string, section?: string) => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onNavigateToDashboard: () => void;
  onAuthModalSignIn: (email: string, password: string) => Promise<any>;
  userRole?: string;
  userProfile?: any;
  requireAuth?: (action: string) => boolean;
  demoMode?: boolean;
}