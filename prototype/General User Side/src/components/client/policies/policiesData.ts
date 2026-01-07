// Sample data for MOAs and MOUs - client-facing policies
// This would typically come from a database or API

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

export const SAMPLE_POLICIES_DATA: PolicyDocument[] = [
  // Memorandum of Agreements (MOA)
  {
    id: 'moa-2024-001',
    title: 'Research Collaboration Agreement with DOST',
    description: 'Joint research development initiative focusing on technology transfer and innovation partnerships between CSU and the Department of Science and Technology. This agreement establishes the framework for collaborative research projects, resource sharing, and knowledge exchange.',
    type: 'MOA',
    status: 'Active',
    dateCreated: '2024-01-15',
    lastUpdated: '2024-01-20',
    entity: 'Department of Science and Technology (DOST)',
    category: 'Research Collaboration',
    priority: 'High',
    attachments: {
      count: 8,
      hasSignedCopy: true,
      types: ['PDF', 'DOCX', 'XLSX']
    },
    tags: ['Research', 'Technology Transfer', 'Innovation', 'DOST', 'Collaboration'],
    downloadUrl: '#download-moa-001',
    previewUrl: '#preview-moa-001',
    effectiveDate: '2024-02-01',
    expiryDate: '2027-01-31',
    signatories: ['Dr. Maria Santos (CSU)', 'Sec. Fortunato de la Peña (DOST)']
  },
  {
    id: 'moa-2024-002',
    title: 'Industry Partnership for Skills Development',
    description: 'Agreement with Philippine Manufacturing Association for enhanced industry-academic collaboration and workforce development programs. This partnership aims to bridge the skills gap and provide students with relevant industry experience.',
    type: 'MOA',
    status: 'Under Review',
    dateCreated: '2024-02-20',
    lastUpdated: '2024-02-25',
    entity: 'Philippine Manufacturing Association',
    category: 'Industry Partnership',
    priority: 'High',
    attachments: {
      count: 4,
      hasSignedCopy: false,
      types: ['PDF', 'DOCX']
    },
    tags: ['Industry', 'Skills Development', 'Workforce', 'Training', 'Manufacturing'],
    downloadUrl: '#download-moa-002',
    previewUrl: '#preview-moa-002',
    effectiveDate: '2024-03-15',
    expiryDate: '2026-03-14',
    signatories: ['Prof. Juan Cruz (CSU)', 'Mr. Roberto Pascual (PMA)']
  },
  {
    id: 'moa-2024-003',
    title: 'Sustainable Agriculture Development Partnership',
    description: 'Memorandum of Agreement with the Department of Agriculture for sustainable farming practices, agricultural research, and extension services to support local farming communities.',
    type: 'MOA',
    status: 'Active',
    dateCreated: '2024-01-30',
    lastUpdated: '2024-02-05',
    entity: 'Department of Agriculture',
    category: 'Agriculture Development',
    priority: 'Medium',
    attachments: {
      count: 6,
      hasSignedCopy: true,
      types: ['PDF', 'DOCX', 'XLSX']
    },
    tags: ['Agriculture', 'Sustainability', 'Research', 'Extension', 'Community'],
    downloadUrl: '#download-moa-003',
    previewUrl: '#preview-moa-003',
    effectiveDate: '2024-02-15',
    expiryDate: '2025-02-14',
    signatories: ['Dr. Agricultural Director (CSU)', 'Sec. Francisco Tiu Laurel Jr. (DA)']
  },

  // Memorandum of Understanding (MOU)
  {
    id: 'mou-2024-001',
    title: 'International Academic Exchange Program',
    description: 'Memorandum of Understanding for student and faculty exchange programs with international partner universities. This agreement facilitates academic mobility, cultural exchange, and collaborative research opportunities.',
    type: 'MOU',
    status: 'Active',
    dateCreated: '2024-03-01',
    lastUpdated: '2024-03-12',
    entity: 'University of International Studies',
    category: 'International Relations',
    priority: 'High',
    attachments: {
      count: 10,
      hasSignedCopy: true,
      types: ['PDF', 'DOCX']
    },
    tags: ['International', 'Exchange', 'Education', 'Partnership', 'Students'],
    downloadUrl: '#download-mou-001',
    previewUrl: '#preview-mou-001',
    effectiveDate: '2024-04-01',
    expiryDate: '2029-03-31',
    signatories: ['Dr. Elena Global (CSU)', 'Prof. International President (UIS)']
  },
  {
    id: 'mou-2024-002',
    title: 'Marine Conservation Research Collaboration',
    description: 'Understanding between CSU and Marine Science Institute for collaborative research on marine biodiversity conservation in the Caraga region waters.',
    type: 'MOU',
    status: 'Active',
    dateCreated: '2024-02-10',
    lastUpdated: '2024-02-15',
    entity: 'Marine Science Institute',
    category: 'Environmental Research',
    priority: 'Medium',
    attachments: {
      count: 5,
      hasSignedCopy: true,
      types: ['PDF', 'DOCX']
    },
    tags: ['Marine', 'Conservation', 'Research', 'Environment', 'Biodiversity'],
    downloadUrl: '#download-mou-002',
    previewUrl: '#preview-mou-002',
    effectiveDate: '2024-03-01',
    expiryDate: '2027-02-28',
    signatories: ['Dr. Marine Researcher (CSU)', 'Dir. Ocean Scientist (MSI)']
  },
  {
    id: 'mou-2024-003',
    title: 'Cultural Heritage Preservation Initiative',
    description: 'Memorandum of Understanding with National Museum for the preservation and promotion of Caraga regional cultural heritage through education and research programs.',
    type: 'MOU',
    status: 'Approved',
    dateCreated: '2024-01-25',
    lastUpdated: '2024-02-01',
    entity: 'National Museum of the Philippines',
    category: 'Cultural Heritage',
    priority: 'Medium',
    attachments: {
      count: 7,
      hasSignedCopy: true,
      types: ['PDF', 'DOCX', 'XLSX']
    },
    tags: ['Culture', 'Heritage', 'Museum', 'Education', 'Preservation'],
    downloadUrl: '#download-mou-003',
    previewUrl: '#preview-mou-003',
    effectiveDate: '2024-02-15',
    expiryDate: '2026-02-14',
    signatories: ['Dr. Cultural Studies (CSU)', 'Dir. Jeremy Barns (National Museum)']
  },

  // University Policies
  {
    id: 'policy-2024-001',
    title: 'Academic Quality Assurance Policy',
    description: 'Comprehensive policy framework for maintaining and improving academic standards across all university programs and departments. This policy ensures consistent quality in education delivery and assessment.',
    type: 'Policy',
    status: 'Approved',
    dateCreated: '2024-01-10',
    lastUpdated: '2024-01-15',
    entity: 'Academic Affairs Office',
    category: 'Academic Standards',
    priority: 'High',
    attachments: {
      count: 6,
      hasSignedCopy: true,
      types: ['PDF', 'DOCX']
    },
    tags: ['Academic', 'Quality Assurance', 'Standards', 'Policy', 'Education'],
    downloadUrl: '#download-policy-001',
    previewUrl: '#preview-policy-001',
    effectiveDate: '2024-02-01',
    signatories: ['President (CSU)', 'VP Academic Affairs (CSU)']
  },
  {
    id: 'policy-2024-002',
    title: 'Research Ethics and Integrity Policy',
    description: 'Policy governing research conduct, ethical standards, and integrity measures for all research activities conducted within the university.',
    type: 'Policy',
    status: 'Active',
    dateCreated: '2024-01-20',
    lastUpdated: '2024-02-01',
    entity: 'Research and Development Office',
    category: 'Research Governance',
    priority: 'High',
    attachments: {
      count: 8,
      hasSignedCopy: true,
      types: ['PDF', 'DOCX']
    },
    tags: ['Research', 'Ethics', 'Integrity', 'Governance', 'Standards'],
    downloadUrl: '#download-policy-002',
    previewUrl: '#preview-policy-002',
    effectiveDate: '2024-02-15',
    signatories: ['President (CSU)', 'Research Director (CSU)']
  },
  {
    id: 'policy-2024-003',
    title: 'Student Welfare and Support Services Policy',
    description: 'Comprehensive policy outlining student support services, welfare programs, and mechanisms for addressing student concerns and needs.',
    type: 'Policy',
    status: 'Active',
    dateCreated: '2024-02-05',
    lastUpdated: '2024-02-10',
    entity: 'Student Affairs Office',
    category: 'Student Services',
    priority: 'Medium',
    attachments: {
      count: 5,
      hasSignedCopy: true,
      types: ['PDF', 'DOCX']
    },
    tags: ['Student', 'Welfare', 'Support', 'Services', 'Policy'],
    downloadUrl: '#download-policy-003',
    previewUrl: '#preview-policy-003',
    effectiveDate: '2024-02-20',
    signatories: ['President (CSU)', 'Student Affairs Director (CSU)']
  },

  // Other Agreements
  {
    id: 'agreement-2024-001',
    title: 'Community Extension Services Framework',
    description: 'Framework agreement for university-community partnerships in extension services and outreach programs. This agreement establishes guidelines for community engagement and service delivery.',
    type: 'Agreement',
    status: 'Active',
    dateCreated: '2024-02-05',
    lastUpdated: '2024-02-10',
    entity: 'Community Development Council',
    category: 'Community Relations',
    priority: 'Medium',
    attachments: {
      count: 5,
      hasSignedCopy: true,
      types: ['PDF', 'XLSX']
    },
    tags: ['Community', 'Extension', 'Outreach', 'Services', 'Partnership'],
    downloadUrl: '#download-agreement-001',
    previewUrl: '#preview-agreement-001',
    effectiveDate: '2024-03-01',
    expiryDate: '2025-02-28',
    signatories: ['Extension Director (CSU)', 'Community Leader (CDC)']
  },
  {
    id: 'agreement-2024-002',
    title: 'Campus Security and Safety Partnership',
    description: 'Agreement with local law enforcement for enhanced campus security, emergency response protocols, and safety measures for the university community.',
    type: 'Agreement',
    status: 'Active',
    dateCreated: '2024-01-05',
    lastUpdated: '2024-01-10',
    entity: 'Local Police Department',
    category: 'Security and Safety',
    priority: 'High',
    attachments: {
      count: 4,
      hasSignedCopy: true,
      types: ['PDF', 'DOCX']
    },
    tags: ['Security', 'Safety', 'Emergency', 'Law Enforcement', 'Campus'],
    downloadUrl: '#download-agreement-002',
    previewUrl: '#preview-agreement-002',
    effectiveDate: '2024-01-15',
    expiryDate: '2025-01-14',
    signatories: ['Security Director (CSU)', 'Police Chief (LPD)']
  },
  {
    id: 'agreement-2024-003',
    title: 'Environmental Sustainability Initiative',
    description: 'Partnership agreement for implementing environmental sustainability programs, waste management systems, and green campus initiatives.',
    type: 'Agreement',
    status: 'Under Review',
    dateCreated: '2024-02-20',
    lastUpdated: '2024-02-25',
    entity: 'Environmental Protection Agency',
    category: 'Environmental Sustainability',
    priority: 'Medium',
    attachments: {
      count: 3,
      hasSignedCopy: false,
      types: ['PDF']
    },
    tags: ['Environment', 'Sustainability', 'Green Campus', 'Waste Management', 'Conservation'],
    downloadUrl: '#download-agreement-003',
    previewUrl: '#preview-agreement-003',
    effectiveDate: '2024-04-01',
    expiryDate: '2026-03-31',
    signatories: ['Facilities Director (CSU)', 'Regional Director (EPA)']
  },
  // Additional MOA Documents
  {
    id: 'moa-2024-004',
    title: 'Public-Private Partnership for Campus Development',
    description: 'Strategic partnership agreement with private sector for campus infrastructure development and modernization projects.',
    type: 'MOA',
    status: 'Active',
    dateCreated: '2024-01-12',
    lastUpdated: '2024-01-18',
    entity: 'Metro Development Corporation',
    category: 'Infrastructure Development',
    priority: 'High',
    attachments: {
      count: 12,
      hasSignedCopy: true,
      types: ['PDF', 'DOCX', 'XLSX', 'DWG']
    },
    tags: ['PPP', 'Infrastructure', 'Development', 'Private Sector', 'Campus'],
    downloadUrl: '#download-moa-004',
    previewUrl: '#preview-moa-004',
    effectiveDate: '2024-02-01',
    expiryDate: '2029-01-31',
    signatories: ['President (CSU)', 'CEO Metro Development Corp']
  },
  // Additional MOU Documents
  {
    id: 'mou-2024-004',
    title: 'Teacher Training and Professional Development',
    description: 'Collaborative teacher training programs and professional development initiatives with Department of Education.',
    type: 'MOU',
    status: 'Active',
    dateCreated: '2024-02-18',
    lastUpdated: '2024-02-22',
    entity: 'Department of Education',
    category: 'Professional Development',
    priority: 'Medium',
    attachments: {
      count: 6,
      hasSignedCopy: true,
      types: ['PDF', 'DOCX']
    },
    tags: ['Education', 'Training', 'Teachers', 'Professional Development', 'DepEd'],
    downloadUrl: '#download-mou-004',
    previewUrl: '#preview-mou-004',
    effectiveDate: '2024-03-01',
    expiryDate: '2026-02-28',
    signatories: ['Dean of Education (CSU)', 'Regional Director (DepEd)']
  },
  // Additional Policy Documents
  {
    id: 'policy-2024-004',
    title: 'Information Technology and Data Security Policy',
    description: 'Comprehensive policy for IT governance, data protection, cybersecurity measures, and digital infrastructure management.',
    type: 'Policy',
    status: 'Active',
    dateCreated: '2024-01-08',
    lastUpdated: '2024-01-25',
    entity: 'Information Technology Office',
    category: 'IT Governance',
    priority: 'High',
    attachments: {
      count: 9,
      hasSignedCopy: true,
      types: ['PDF', 'DOCX']
    },
    tags: ['IT', 'Cybersecurity', 'Data Protection', 'Technology', 'Governance'],
    downloadUrl: '#download-policy-004',
    previewUrl: '#preview-policy-004',
    effectiveDate: '2024-02-01',
    signatories: ['President (CSU)', 'IT Director (CSU)']
  },
  {
    id: 'policy-2024-005',
    title: 'Environmental Sustainability and Green Campus Policy',
    description: 'University-wide policy promoting environmental sustainability, waste reduction, energy efficiency, and green campus initiatives.',
    type: 'Policy',
    status: 'Under Review',
    dateCreated: '2024-02-28',
    lastUpdated: '2024-03-05',
    entity: 'Environmental Affairs Office',
    category: 'Environmental Policy',
    priority: 'Medium',
    attachments: {
      count: 4,
      hasSignedCopy: false,
      types: ['PDF', 'DOCX']
    },
    tags: ['Environment', 'Sustainability', 'Green Campus', 'Climate', 'Conservation'],
    downloadUrl: '#download-policy-005',
    previewUrl: '#preview-policy-005',
    effectiveDate: '2024-04-01',
    signatories: ['President (CSU)', 'Environmental Affairs Director (CSU)']
  },
  // Additional Agreement Documents
  {
    id: 'agreement-2024-004',
    title: 'Alumni Association Collaboration Framework',
    description: 'Formal agreement establishing collaboration frameworks with Alumni Association for networking, mentorship, and career development programs.',
    type: 'Agreement',
    status: 'Active',
    dateCreated: '2024-01-20',
    lastUpdated: '2024-01-25',
    entity: 'CSU Alumni Association',
    category: 'Alumni Relations',
    priority: 'Low',
    attachments: {
      count: 3,
      hasSignedCopy: true,
      types: ['PDF', 'DOCX']
    },
    tags: ['Alumni', 'Networking', 'Career Development', 'Mentorship', 'Association'],
    downloadUrl: '#download-agreement-004',
    previewUrl: '#preview-agreement-004',
    effectiveDate: '2024-02-01',
    expiryDate: '2025-01-31',
    signatories: ['VP External Affairs (CSU)', 'Alumni Association President']
  }
];

// Statistics derived from the sample data
export const POLICIES_STATISTICS = {
  totalDocuments: SAMPLE_POLICIES_DATA.length,
  activeDocuments: SAMPLE_POLICIES_DATA.filter(doc => doc.status === 'Active').length,
  moaCount: SAMPLE_POLICIES_DATA.filter(doc => doc.type === 'MOA').length,
  mouCount: SAMPLE_POLICIES_DATA.filter(doc => doc.type === 'MOU').length,
  policyCount: SAMPLE_POLICIES_DATA.filter(doc => doc.type === 'Policy').length,
  agreementCount: SAMPLE_POLICIES_DATA.filter(doc => doc.type === 'Agreement').length,
  recentUpdates: SAMPLE_POLICIES_DATA.filter(doc => {
    const lastUpdate = new Date(doc.lastUpdated);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return lastUpdate > thirtyDaysAgo;
  }).length,
  upcomingExpirations: SAMPLE_POLICIES_DATA.filter(doc => {
    if (!doc.expiryDate) return false;
    const expiryDate = new Date(doc.expiryDate);
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    return expiryDate <= sixMonthsFromNow && expiryDate > new Date();
  }).length,
  highPriorityCount: SAMPLE_POLICIES_DATA.filter(doc => doc.priority === 'High').length,
  categoriesCount: [...new Set(SAMPLE_POLICIES_DATA.map(doc => doc.category))].length
};

// Categories for filtering
export const POLICY_CATEGORIES = [
  'Research Collaboration',
  'Industry Partnership',
  'Agriculture Development',
  'International Relations',
  'Environmental Research',
  'Cultural Heritage',
  'Academic Standards',
  'Research Governance',
  'Student Services',
  'Community Relations',
  'Security and Safety',
  'Environmental Sustainability'
];

// Status options
export const POLICY_STATUSES = [
  'Active',
  'Under Review',
  'Approved',
  'Expired',
  'Draft'
];

// Document types
export const DOCUMENT_TYPES = [
  'MOA',
  'MOU',
  'Policy',
  'Agreement'
];

// Priority levels
export const PRIORITY_LEVELS = [
  'High',
  'Medium',
  'Low'
];