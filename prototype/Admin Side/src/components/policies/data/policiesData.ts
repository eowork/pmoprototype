/**
 * Shared Policies Data for MOA and MOU
 * Centralized data source for statistics and document management
 */

export interface PolicyAgreement {
  id: string;
  date: string;
  memoNo: string;
  forEntity: string;
  subject: string;
  documentType: string;
  preparedBy: string;
  status: 'Draft' | 'Under Review' | 'Approved' | 'Active' | 'Expired' | 'Pending Signature';
  attachedDocuments: {
    hasSignedCopy: boolean;
    hasDPCRAttachment: boolean;
    hasIPCRAttachment: boolean;
    attachmentCount: number;
  };
  tags: string[];
  personnelAssigned: string[];
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  location: string;
  effectivenessScore: number;
  lastModified: string;
  reviewDate: string;
  createdBy?: string;
  verificationStatus?: 'Pending' | 'Verified' | 'Rejected';
  verifiedBy?: string;
  verifiedDate?: string;
}

// Mock data for MOA
export const VALIDITY_MOA_DATA: PolicyAgreement[] = [
  {
    id: 'moa-2024-001',
    date: '2024-01-15',
    memoNo: 'MOA-2024-001',
    forEntity: 'DOST - Department of Science and Technology',
    subject: 'Joint Research and Development Initiative for Technology Transfer',
    documentType: 'Memorandum of Agreement',
    preparedBy: 'Dr. Maria Santos, Research Director',
    status: 'Active',
    attachedDocuments: {
      hasSignedCopy: true,
      hasDPCRAttachment: true,
      hasIPCRAttachment: true,
      attachmentCount: 8
    },
    tags: ['Research Collaboration', 'Technology Transfer', 'Innovation', 'DOST Partnership', 'High Priority'],
    personnelAssigned: ['Dr. Maria Santos', 'Prof. John Cruz', 'Ms. Ana Reyes', 'Dr. Robert Tech'],
    description: 'Joint research development initiative focusing on technology transfer and innovation',
    priority: 'High',
    location: 'Main Campus',
    effectivenessScore: 92,
    lastModified: '2024-01-20',
    reviewDate: '2024-07-15'
  },
  {
    id: 'moa-2024-002',
    date: '2024-02-20',
    memoNo: 'MOA-2024-002',
    forEntity: 'Philippine Manufacturing Association',
    subject: 'Industry Partnership for Skills Development Program',
    documentType: 'Memorandum of Agreement',
    preparedBy: 'Prof. Juan Cruz, Academic Affairs',
    status: 'Under Review',
    attachedDocuments: {
      hasSignedCopy: false,
      hasDPCRAttachment: true,
      hasIPCRAttachment: false,
      attachmentCount: 4
    },
    tags: ['Industry Partnership', 'Skills Development', 'Workforce Training', 'PMA Collaboration'],
    personnelAssigned: ['Prof. Juan Cruz', 'Dr. Skills Manager', 'Ms. Training Coordinator'],
    description: 'Enhanced industry-academic collaboration for workforce development',
    priority: 'High',
    location: 'Cabadbaran Campus',
    effectivenessScore: 88,
    lastModified: '2024-02-25',
    reviewDate: '2024-08-20'
  },
  {
    id: 'moa-2023-015',
    date: '2023-08-10',
    memoNo: 'MOA-2023-015',
    forEntity: 'Local Government Units - CARAGA Region',
    subject: 'Community Development Outreach Program Agreement',
    documentType: 'Memorandum of Agreement',
    preparedBy: 'Dr. Ana Reyes, Extension Director',
    status: 'Expired',
    attachedDocuments: {
      hasSignedCopy: true,
      hasDPCRAttachment: true,
      hasIPCRAttachment: true,
      attachmentCount: 12
    },
    tags: ['Community Development', 'Extension Services', 'LGU Partnership', 'Outreach Program', 'CARAGA Region'],
    personnelAssigned: ['Dr. Ana Reyes', 'Community Coordinator', 'Extension Officer', 'LGU Liaison'],
    description: 'Sustainable community development and extension services initiative',
    priority: 'Medium',
    location: 'Multiple Locations',
    effectivenessScore: 85,
    lastModified: '2024-01-05',
    reviewDate: '2024-02-10'
  },
  {
    id: 'moa-2024-003',
    date: '2024-03-10',
    memoNo: 'MOA-2024-003',
    forEntity: 'Provincial Government of Agusan del Norte',
    subject: 'Sustainable Agriculture and Food Security Partnership',
    documentType: 'Memorandum of Agreement',
    preparedBy: 'Dr. Agro Science, Agriculture Department',
    status: 'Active',
    attachedDocuments: {
      hasSignedCopy: true,
      hasDPCRAttachment: true,
      hasIPCRAttachment: true,
      attachmentCount: 6
    },
    tags: ['Agriculture', 'Food Security', 'Provincial Partnership', 'Sustainable Development'],
    personnelAssigned: ['Dr. Agro Science', 'Agriculture Coordinator'],
    description: 'Partnership for sustainable agriculture practices and food security',
    priority: 'High',
    location: 'Provincial Wide',
    effectivenessScore: 90,
    lastModified: '2024-03-15',
    reviewDate: '2024-09-10'
  },
  {
    id: 'moa-2024-004',
    date: '2024-04-05',
    memoNo: 'MOA-2024-004',
    forEntity: 'Department of Environment and Natural Resources',
    subject: 'Environmental Conservation and Climate Action Initiative',
    documentType: 'Memorandum of Agreement',
    preparedBy: 'Dr. Green Environment, Environmental Science',
    status: 'Draft',
    attachedDocuments: {
      hasSignedCopy: false,
      hasDPCRAttachment: false,
      hasIPCRAttachment: false,
      attachmentCount: 2
    },
    tags: ['Environment', 'Climate Action', 'Conservation', 'DENR Partnership'],
    personnelAssigned: ['Dr. Green Environment'],
    description: 'Collaborative initiative for environmental conservation and climate change mitigation',
    priority: 'High',
    location: 'Regional',
    effectivenessScore: 0,
    lastModified: '2024-04-08',
    reviewDate: '2024-10-05'
  },
  {
    id: 'moa-2024-005',
    date: '2024-05-12',
    memoNo: 'MOA-2024-005',
    forEntity: 'National Economic and Development Authority',
    subject: 'Regional Development Planning and Policy Research',
    documentType: 'Memorandum of Agreement',
    status: 'Draft',
    preparedBy: 'Dr. Policy Research, Planning Office',
    attachedDocuments: {
      hasSignedCopy: false,
      hasDPCRAttachment: false,
      hasIPCRAttachment: false,
      attachmentCount: 1
    },
    tags: ['Policy Research', 'Development Planning', 'NEDA', 'Regional Development'],
    personnelAssigned: ['Dr. Policy Research'],
    description: 'Collaborative research on regional development planning and policy formulation',
    priority: 'Medium',
    location: 'CARAGA Region',
    effectivenessScore: 0,
    lastModified: '2024-05-15',
    reviewDate: '2024-11-12'
  }
];

// Mock data for MOU
export const VALIDITY_MOU_DATA: PolicyAgreement[] = [
  {
    id: 'mou-2024-003',
    date: '2024-03-01',
    memoNo: 'MOU-2024-003',
    forEntity: 'University of International Studies',
    subject: 'International Academic Exchange Program',
    documentType: 'Memorandum of Understanding',
    preparedBy: 'Dr. Elena Global, International Affairs',
    status: 'Active',
    attachedDocuments: {
      hasSignedCopy: true,
      hasDPCRAttachment: true,
      hasIPCRAttachment: true,
      attachmentCount: 10
    },
    tags: ['International Exchange', 'Academic Collaboration', 'Student Mobility', 'Global Partnership', 'Education'],
    personnelAssigned: ['Dr. Elena Global', 'Exchange Coordinator', 'International Relations Officer', 'Student Affairs Manager'],
    description: 'Enhanced international academic collaboration and student exchange',
    priority: 'High',
    location: 'Main Campus',
    effectivenessScore: 94,
    lastModified: '2024-03-12',
    reviewDate: '2024-09-01'
  },
  {
    id: 'mou-2023-018',
    date: '2023-09-15',
    memoNo: 'MOU-2023-018',
    forEntity: 'CARAGA Academic Libraries Network',
    subject: 'Regional Library Consortium Partnership',
    documentType: 'Memorandum of Understanding',
    preparedBy: 'Dr. Carmen Books, Library Services',
    status: 'Active',
    attachedDocuments: {
      hasSignedCopy: true,
      hasDPCRAttachment: true,
      hasIPCRAttachment: false,
      attachmentCount: 5
    },
    tags: ['Library Consortium', 'Resource Sharing', 'Digital Access', 'Academic Resources', 'CARAGA Network'],
    personnelAssigned: ['Dr. Carmen Books', 'Library Systems Manager', 'Digital Resources Specialist', 'Network Administrator'],
    description: 'Enhanced library resources and digital access collaboration',
    priority: 'Medium',
    location: 'Both Campuses',
    effectivenessScore: 89,
    lastModified: '2024-01-08',
    reviewDate: '2024-03-15'
  },
  {
    id: 'mou-2024-004',
    date: '2024-04-10',
    memoNo: 'MOU-2024-004',
    forEntity: 'Regional Science Consortium',
    subject: 'Collaborative STEM Education Enhancement Initiative',
    documentType: 'Memorandum of Understanding',
    preparedBy: 'Prof. Science Lead, STEM Department',
    status: 'Draft',
    attachedDocuments: {
      hasSignedCopy: false,
      hasDPCRAttachment: false,
      hasIPCRAttachment: false,
      attachmentCount: 3
    },
    tags: ['STEM Education', 'Regional Collaboration', 'Science Enhancement', 'Academic Partnership'],
    personnelAssigned: ['Prof. Science Lead', 'STEM Coordinator'],
    description: 'Regional STEM education improvement and resource sharing',
    priority: 'High',
    location: 'Regional',
    effectivenessScore: 0,
    lastModified: '2024-04-15',
    reviewDate: '2024-10-10'
  }
];

// Utility function to calculate policy statistics
export interface PolicyStats {
  moa: {
    total: number;
    active: number;
    expiring: number;
    pending: number;
    draft: number;
    expired: number;
    underReview: number;
  };
  mou: {
    total: number;
    active: number;
    expiring: number;
    pending: number;
    draft: number;
    expired: number;
    underReview: number;
  };
}

export function calculatePolicyStats(): PolicyStats {
  const moaStats = {
    total: VALIDITY_MOA_DATA.length,
    active: VALIDITY_MOA_DATA.filter(doc => doc.status === 'Active').length,
    expiring: VALIDITY_MOA_DATA.filter(doc => {
      if (!doc.reviewDate) return false;
      const reviewDate = new Date(doc.reviewDate);
      const today = new Date();
      const daysUntilReview = Math.floor((reviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilReview > 0 && daysUntilReview <= 90 && doc.status === 'Active'; // Expiring within 90 days
    }).length,
    pending: VALIDITY_MOA_DATA.filter(doc => doc.status === 'Pending Signature').length,
    draft: VALIDITY_MOA_DATA.filter(doc => doc.status === 'Draft').length,
    expired: VALIDITY_MOA_DATA.filter(doc => doc.status === 'Expired').length,
    underReview: VALIDITY_MOA_DATA.filter(doc => doc.status === 'Under Review').length
  };

  const mouStats = {
    total: VALIDITY_MOU_DATA.length,
    active: VALIDITY_MOU_DATA.filter(doc => doc.status === 'Active').length,
    expiring: VALIDITY_MOU_DATA.filter(doc => {
      if (!doc.reviewDate) return false;
      const reviewDate = new Date(doc.reviewDate);
      const today = new Date();
      const daysUntilReview = Math.floor((reviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilReview > 0 && daysUntilReview <= 90 && doc.status === 'Active'; // Expiring within 90 days
    }).length,
    pending: VALIDITY_MOU_DATA.filter(doc => doc.status === 'Pending Signature').length,
    draft: VALIDITY_MOU_DATA.filter(doc => doc.status === 'Draft').length,
    expired: VALIDITY_MOU_DATA.filter(doc => doc.status === 'Expired').length,
    underReview: VALIDITY_MOU_DATA.filter(doc => doc.status === 'Under Review').length
  };

  return { moa: moaStats, mou: mouStats };
}

// Helper function to get all policies combined
export function getAllPolicies(): PolicyAgreement[] {
  return [...VALIDITY_MOA_DATA, ...VALIDITY_MOU_DATA];
}

// Helper function to get policies by status
export function getPoliciesByStatus(status: PolicyAgreement['status']): PolicyAgreement[] {
  return getAllPolicies().filter(doc => doc.status === status);
}

// Helper function to get policies by type
export function getPoliciesByType(type: 'MOA' | 'MOU'): PolicyAgreement[] {
  return type === 'MOA' ? VALIDITY_MOA_DATA : VALIDITY_MOU_DATA;
}
