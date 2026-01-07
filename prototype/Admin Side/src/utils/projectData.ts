// Mock database for project data management
// In a real application, this would be replaced with actual database operations

export interface Project {
  id: string;
  projectName: string;
  totalContractAmount: number;
  physicalAccomplishment: number;
  powStatus: 'Pending' | 'Approved' | 'Rejected' | 'For Approval';
  location: string;
  startDate: string;
  endDate?: string;
  contractor: string;
  category: string;
  description?: string;
  status: 'Planning' | 'Ongoing' | 'Completed' | 'On Hold' | 'Cancelled' | 'In Progress';
  progress: number;
  budgetUtilized: number;
  materialCost?: number;
  laborCost?: number;
  // Enhanced variance tracking
  expectedProgressValue?: number;
  budgetVariance?: number;
  variancePercentage?: number;
  varianceStatus?: 'Over Budget' | 'Under Budget' | 'On Track';
  // Additional fields for enhanced functionality
  documents?: ProjectDocument[];
  photos?: ProjectPhoto[];
  plannedProgress?: number;
  qualityRating?: number;
  safetyRating?: number;
  progressNotes?: string;
  actualDuration?: number;
  delayReason?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  name: string;
  size: string;
  type: string;
  uploadDate: string;
  uploadedBy: string;
  url?: string;
}

export interface ProjectPhoto {
  id: string;
  projectId: string;
  name: string;
  description: string;
  uploadDate: string;
  uploadedBy: string;
  url?: string;
}

export interface BudgetItem {
  id: string;
  projectId: string;
  category: string;
  allocatedAmount: number;
  utilizedAmount: number;
  description?: string;
}

// Enhanced variance calculation function
export const calculateProjectVariance = (project: Project) => {
  const expectedProgressValue = (project.physicalAccomplishment / 100) * project.totalContractAmount;
  const budgetVariance = project.budgetUtilized - expectedProgressValue;
  const variancePercentage = expectedProgressValue > 0 ? (budgetVariance / expectedProgressValue) * 100 : 0;
  
  let varianceStatus: 'Over Budget' | 'Under Budget' | 'On Track' = 'On Track';
  if (budgetVariance > (project.totalContractAmount * 0.05)) { // 5% threshold
    varianceStatus = 'Over Budget';
  } else if (budgetVariance < -(project.totalContractAmount * 0.05)) {
    varianceStatus = 'Under Budget';
  }

  return {
    expectedProgressValue,
    budgetVariance,
    variancePercentage,
    varianceStatus,
    isOverBudget: budgetVariance > 0
  };
};

// Project generator function for categories
export const generateProjectsByCategory = (category: string, count: number = 20): Project[] => {
  const projects: Project[] = [];
  const statuses: Array<'Planning' | 'In Progress' | 'Completed' | 'On Hold'> = ['Planning', 'In Progress', 'Completed', 'On Hold'];
  const locations = ['CSU Main Campus', 'CSU CC Campus', 'CSU BXU Campus', 'Engineering Building', 'Science Building', 'Library', 'Administrative Building'];
  
  // Enhanced category-specific project templates with diverse subcategory data
  const projectTemplates: Record<string, any> = {
    // University Operations - Higher Education Programs
    'higher-education-program': [
      { prefix: 'Undergraduate Curriculum Enhancement', description: 'Development and improvement of undergraduate degree programs and course offerings' },
      { prefix: 'Faculty Professional Development', description: 'Training and capability building programs for academic faculty members' },
      { prefix: 'Student Academic Support Services', description: 'Comprehensive academic support and tutoring programs for students' },
      { prefix: 'Academic Assessment System', description: 'Implementation of modern assessment and evaluation systems' },
      { prefix: 'Learning Management Platform', description: 'Digital learning platform development and integration' }
    ],
    
    // University Operations - Advanced Education Programs
    'advanced-education-program': [
      { prefix: 'Graduate Program Development', description: 'Establishment and enhancement of master\'s and doctoral degree programs' },
      { prefix: 'Research Methodology Training', description: 'Advanced research skills development for graduate students and faculty' },
      { prefix: 'International Academic Exchange', description: 'Student and faculty exchange programs with international universities' },
      { prefix: 'Specialized Certification Programs', description: 'Professional certification and continuing education programs' },
      { prefix: 'Advanced Laboratory Setup', description: 'Establishment of specialized laboratories for advanced research and education' }
    ],
    
    // University Operations - Research Programs
    'research-program': [
      { prefix: 'Interdisciplinary Research Initiative', description: 'Cross-department collaborative research projects and programs' },
      { prefix: 'Research Equipment Acquisition', description: 'Purchase and installation of advanced research equipment and instruments' },
      { prefix: 'Publication Support Program', description: 'Support for academic publications and research dissemination' },
      { prefix: 'Research Ethics and Integrity', description: 'Development of research ethics protocols and training programs' },
      { prefix: 'Innovation and Technology Transfer', description: 'Commercialization and technology transfer of research outputs' }
    ],
    
    // University Operations - Technical Advisory Extension
    'technical-advisory-extension-program': [
      { prefix: 'Industry Partnership Development', description: 'Building partnerships with industry for technical advisory services' },
      { prefix: 'Community Technical Assistance', description: 'Providing technical expertise and advisory services to local communities' },
      { prefix: 'Technology Demonstration Projects', description: 'Showcasing innovative technologies and best practices' },
      { prefix: 'Expert Consultation Services', description: 'Faculty expertise consultation for government and private sector' },
      { prefix: 'Technical Skills Training', description: 'Specialized technical training programs for various sectors' }
    ],
    
    // Construction of Infrastructure - GAA-Funded Projects
    'gaa-funded-projects': [
      { prefix: 'National Government Building Project', description: 'Major infrastructure projects funded through General Appropriations Act' },
      { prefix: 'Federal Education Infrastructure', description: 'Nationally-funded educational facility construction and upgrade projects' },
      { prefix: 'Government Research Facility', description: 'Research infrastructure development through national government funding' },
      { prefix: 'Public Education Enhancement', description: 'Large-scale educational infrastructure improvements with federal support' },
      { prefix: 'National Development Program', description: 'University infrastructure aligned with national development goals' }
    ],
    
    // Construction of Infrastructure - Locally-Funded Projects
    'locally-funded-projects': [
      { prefix: 'Local Government Partnership', description: 'Infrastructure projects funded through local government partnerships' },
      { prefix: 'Community Development Initiative', description: 'Locally-funded community-focused infrastructure development' },
      { prefix: 'Regional Infrastructure Support', description: 'Regional government-supported facility development projects' },
      { prefix: 'Municipal Collaboration Project', description: 'Joint university-municipal infrastructure development initiatives' },
      { prefix: 'Local Business Partnership', description: 'Infrastructure projects supported by local business community' }
    ],
    
    // Construction of Infrastructure - Special Grants/Partnerships
    'special-grants-projects': [
      { prefix: 'International Development Grant', description: 'Infrastructure projects funded through international development grants' },
      { prefix: 'Private Foundation Partnership', description: 'Facility development through private foundation support and grants' },
      { prefix: 'Corporate Social Responsibility', description: 'Infrastructure projects funded through corporate CSR programs' },
      { prefix: 'Non-Government Organization', description: 'NGO-supported infrastructure and facility development projects' },
      { prefix: 'International Aid Program', description: 'Foreign aid-funded infrastructure development and improvement projects' }
    ],
    
    // Classroom and Administrative Offices - Classrooms CSU CC BXU
    'classrooms-csu-cc-bxu': [
      { prefix: 'Smart Classroom Technology', description: 'Modern technology integration in CSU CC BXU classroom facilities' },
      { prefix: 'Flexible Learning Spaces', description: 'Adaptive classroom design for diverse teaching methodologies at branch campuses' },
      { prefix: 'Accessibility Improvement', description: 'Making classrooms accessible for students with disabilities at branch locations' },
      { prefix: 'Climate Control Systems', description: 'Air conditioning and ventilation improvements for branch campus classrooms' },
      { prefix: 'Classroom Furniture Upgrade', description: 'Modern and ergonomic furniture installation for enhanced learning environment' }
    ],
    
    // Classroom and Administrative Offices - Administrative Offices CSU CC BXU
    'administrative-offices-csu-cc-bxu': [
      { prefix: 'Digital Office Transformation', description: 'Digitization of administrative processes and office systems at branch campuses' },
      { prefix: 'Office Space Optimization', description: 'Efficient layout and design of administrative office spaces for improved workflow' },
      { prefix: 'Communication Systems Upgrade', description: 'Modern communication and networking infrastructure for administrative offices' },
      { prefix: 'Document Management System', description: 'Implementation of digital document management and filing systems' },
      { prefix: 'Security and Access Control', description: 'Enhanced security systems and access control for administrative areas' }
    ],
    
    // Classroom and Administrative Offices - Prioritization Matrix
    'prioritization-matrix': [
      { prefix: 'Strategic Planning Initiative', description: 'Development of prioritization frameworks for resource allocation and planning' },
      { prefix: 'Resource Allocation System', description: 'Systematic approach to prioritizing and allocating university resources' },
      { prefix: 'Impact Assessment Program', description: 'Evaluation and prioritization based on potential impact and return on investment' },
      { prefix: 'Stakeholder Priority Analysis', description: 'Comprehensive analysis of stakeholder needs and priority requirements' },
      { prefix: 'Decision Support Framework', description: 'Data-driven decision support systems for priority setting and planning' }
    ],
    
    // Legacy categories maintained for backward compatibility
    'university-operations': [
      { prefix: 'Campus Information System', description: 'Digital infrastructure and information management systems' },
      { prefix: 'Student Services Platform', description: 'Student support and academic services system' },
      { prefix: 'Faculty Development Program', description: 'Professional development and training initiatives' },
      { prefix: 'Academic Quality Assurance', description: 'Quality improvement and accreditation processes' }
    ],
    'classroom-administrative-offices': [
      { prefix: 'Classroom Renovation', description: 'Modernization of classroom facilities and equipment' },
      { prefix: 'Administrative Office Setup', description: 'Office space optimization and equipment installation' },
      { prefix: 'Learning Space Enhancement', description: 'Educational environment improvement projects' },
      { prefix: 'Office Infrastructure Upgrade', description: 'Administrative infrastructure modernization' }
    ],
    'construction': [
      { prefix: 'Building Construction', description: 'New building construction and infrastructure development' },
      { prefix: 'Infrastructure Development', description: 'Campus infrastructure and utilities projects' },
      { prefix: 'Facility Expansion', description: 'Expansion of existing facilities and structures' }
    ]
  };

  const templates = projectTemplates[category] || projectTemplates['construction'];

  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Adjust budget ranges based on category type
    let budgetRange = { min: 500000, max: 10000000 }; // Default range
    
    if (category.includes('research') || category.includes('extension')) {
      budgetRange = { min: 800000, max: 15000000 }; // Research projects tend to be larger
    } else if (category.includes('gaa-funded') || category.includes('special-grants')) {
      budgetRange = { min: 5000000, max: 50000000 }; // Major government/grant projects
    } else if (category.includes('classroom') || category.includes('administrative')) {
      budgetRange = { min: 300000, max: 5000000 }; // Classroom/office projects
    } else if (category.includes('locally-funded')) {
      budgetRange = { min: 1000000, max: 20000000 }; // Local government projects
    }
    
    const totalAmount = Math.floor(Math.random() * (budgetRange.max - budgetRange.min)) + budgetRange.min;
    const progress = status === 'Completed' ? 100 : Math.floor(Math.random() * 90) + 10;
    const budgetUtilized = Math.floor((progress / 100) * totalAmount * (0.8 + Math.random() * 0.4));

    // Category-specific contractors
    const contractors = {
      'higher-education-program': ['CSU Academic Development', 'Education Solutions Inc.', 'Curriculum Partners', 'Academic Excellence Corp.'],
      'advanced-education-program': ['Graduate Studies Consultants', 'Research Development Partners', 'Academic Innovation Group', 'Higher Ed Solutions'],
      'research-program': ['Research Equipment Suppliers', 'Innovation Partners', 'Academic Research Corp.', 'Technology Transfer Inc.'],
      'technical-advisory-extension-program': ['Extension Services Partners', 'Community Development Corp.', 'Technical Advisory Group', 'Rural Development Inc.'],
      'gaa-funded-projects': ['National Construction Corp.', 'Government Projects Inc.', 'Federal Builders', 'Public Works Specialists'],
      'locally-funded-projects': ['Local Builders Coop', 'Community Construction', 'Regional Contractors', 'Municipal Partners Inc.'],
      'special-grants-projects': ['International Development Corp.', 'Grant Implementation Partners', 'NGO Construction Group', 'Foundation Builders'],
      'classrooms-csu-cc-bxu': ['Classroom Technology Inc.', 'Educational Spaces Corp.', 'Learning Environment Solutions', 'Campus Furniture Specialists'],
      'administrative-offices-csu-cc-bxu': ['Office Systems Inc.', 'Administrative Solutions Corp.', 'Workplace Technology Group', 'Digital Office Partners'],
      'prioritization-matrix': ['Strategic Planning Consultants', 'Decision Support Systems', 'Management Analytics Corp.', 'Planning Solutions Inc.']
    };

    const categoryContractors = contractors[category as keyof typeof contractors] || ['General Contractor A', 'Construction Corp B', 'Development Inc C'];

    const project: Project = {
      id: `${category}-${String(i + 1).padStart(3, '0')}`,
      projectName: `${template.prefix} ${i + 1}`,
      totalContractAmount: totalAmount,
      physicalAccomplishment: progress,
      powStatus: Math.random() > 0.1 ? 'Approved' : 'Pending',
      location: locations[Math.floor(Math.random() * locations.length)],
      startDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      endDate: new Date(2024 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      contractor: categoryContractors[Math.floor(Math.random() * categoryContractors.length)],
      category: category,
      description: template.description,
      status: status,
      progress: progress,
      budgetUtilized: budgetUtilized,
      materialCost: Math.floor(budgetUtilized * 0.6),
      laborCost: Math.floor(budgetUtilized * 0.4),
      plannedProgress: Math.min(progress + Math.floor(Math.random() * 10), 100),
      qualityRating: Math.floor(Math.random() * 20) + 80, // 80-100
      safetyRating: Math.floor(Math.random() * 20) + 80, // 80-100
      progressNotes: `${template.prefix} ${i + 1} is progressing according to plan with regular updates and stakeholder engagement.`,
      actualDuration: Math.floor(Math.random() * 365) + 30, // 30-365 days
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system@csu.edu.ph',
      lastModifiedBy: 'system@csu.edu.ph'
    };

    // Add variance calculations
    const variance = calculateProjectVariance(project);
    project.expectedProgressValue = variance.expectedProgressValue;
    project.budgetVariance = variance.budgetVariance;
    project.variancePercentage = variance.variancePercentage;
    project.varianceStatus = variance.varianceStatus;

    projects.push(project);
  }

  return projects;
};

// Mock data store - In production, this would be your database
class ProjectDataStore {
  private projects: Map<string, Project> = new Map();
  private documents: Map<string, ProjectDocument[]> = new Map();
  private photos: Map<string, ProjectPhoto[]> = new Map();
  private budgetItems: Map<string, BudgetItem[]> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize with comprehensive CSU project data across all categories
    const sampleProjects: Project[] = [
      // CONSTRUCTION PROJECTS (Infrastructure)
      {
        id: 'const-001',
        projectName: 'University Gymnasium and Cultural Center',
        totalContractAmount: 25000000,
        physicalAccomplishment: 83.1,
        powStatus: 'Approved',
        location: 'CSU Main Campus',
        startDate: '2023-06-01',
        endDate: '2024-12-31',
        contractor: 'Prime Construction Corp',
        category: 'construction',
        description: 'Construction of multi-purpose gymnasium and cultural center for university activities',
        status: 'Ongoing',
        progress: 83.1,
        budgetUtilized: 20775000,
        materialCost: 15000000,
        laborCost: 8000000,
        plannedProgress: 85,
        qualityRating: 92,
        safetyRating: 88,
        progressNotes: 'Project is progressing well. Structural work completed, now focusing on interior finishes.',
        actualDuration: 480,
        createdAt: '2023-06-01T00:00:00Z',
        updatedAt: '2024-11-15T10:30:00Z',
        createdBy: 'admin@csu.edu.ph',
        lastModifiedBy: 'staff@csu.edu.ph'
      },
      {
        id: 'const-002',
        projectName: 'Roofing and Electrical Installation at Kinaadman Canopy',
        materialCost: 108284,
        laborCost: 37600,
        totalContractAmount: 145884,
        physicalAccomplishment: 100.0,
        powStatus: 'Approved',
        location: 'Kinaadman Area',
        startDate: '2024-01-15',
        endDate: '2024-03-30',
        contractor: 'ElectroRoof Solutions',
        category: 'construction',
        description: 'Installation of roofing system and electrical facilities at Kinaadman Canopy',
        status: 'Completed',
        progress: 100,
        budgetUtilized: 145884,
        plannedProgress: 100,
        qualityRating: 95,
        safetyRating: 93,
        progressNotes: 'Project completed successfully with all electrical installations tested and approved.',
        actualDuration: 75,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-03-30T16:45:00Z',
        createdBy: 'admin@csu.edu.ph',
        lastModifiedBy: 'staff@csu.edu.ph'
      },
      {
        id: 'const-003',
        projectName: 'Construction of New Academic Building - Engineering Wing',
        materialCost: 18500000,
        laborCost: 12500000,
        totalContractAmount: 35000000,
        physicalAccomplishment: 45.2,
        powStatus: 'Approved',
        location: 'Engineering Campus',
        startDate: '2024-03-01',
        endDate: '2025-08-31',
        contractor: 'Megalith Construction Inc.',
        category: 'construction',
        description: 'Construction of 4-story academic building for Engineering programs with modern laboratories',
        status: 'Ongoing',
        progress: 45.2,
        budgetUtilized: 15820000,
        plannedProgress: 50,
        qualityRating: 89,
        safetyRating: 91,
        progressNotes: 'Foundation completed. Currently working on structural framework for 2nd floor.',
        actualDuration: 258,
        createdAt: '2024-03-01T00:00:00Z',
        updatedAt: '2024-11-15T14:20:00Z',
        createdBy: 'admin@csu.edu.ph',
        lastModifiedBy: 'staff@csu.edu.ph'
      },

      // MAJOR REPAIRS PROJECTS
      {
        id: 'maj-repair-001',
        projectName: 'Major Structural Repair of Administration Building',
        materialCost: 4200000,
        laborCost: 2800000,
        totalContractAmount: 7500000,
        physicalAccomplishment: 72.5,
        powStatus: 'Approved',
        location: 'Administration Building',
        startDate: '2024-04-15',
        endDate: '2024-11-30',
        contractor: 'Structural Solutions Ltd.',
        category: 'major-repairs',
        description: 'Major structural repairs including foundation reinforcement and roof replacement',
        status: 'Ongoing',
        progress: 72.5,
        budgetUtilized: 5437500,
        plannedProgress: 75,
        qualityRating: 93,
        safetyRating: 95,
        progressNotes: 'Foundation work completed. Roof replacement in progress. Weather delays minimal.',
        actualDuration: 214,
        createdAt: '2024-04-15T00:00:00Z',
        updatedAt: '2024-11-15T09:15:00Z',
        createdBy: 'staff@csu.edu.ph',
        lastModifiedBy: 'staff@csu.edu.ph'
      },
      {
        id: 'maj-repair-002',
        projectName: 'HVAC System Overhaul - Science Building',
        materialCost: 3500000,
        laborCost: 1500000,
        totalContractAmount: 5200000,
        physicalAccomplishment: 88.3,
        powStatus: 'Approved',
        location: 'Science Building',
        startDate: '2024-05-01',
        endDate: '2024-10-31',
        contractor: 'Climate Control Systems',
        category: 'major-repairs',
        description: 'Complete HVAC system replacement for improved air quality and energy efficiency',
        status: 'Ongoing',
        progress: 88.3,
        budgetUtilized: 4591600,
        plannedProgress: 90,
        qualityRating: 91,
        safetyRating: 89,
        progressNotes: 'Installation near completion. Final testing and commissioning scheduled next week.',
        actualDuration: 198,
        createdAt: '2024-05-01T00:00:00Z',
        updatedAt: '2024-11-14T16:30:00Z',
        createdBy: 'admin@csu.edu.ph',
        lastModifiedBy: 'staff@csu.edu.ph'
      },

      // MINOR REPAIRS PROJECTS
      {
        id: 'min-repair-001',
        projectName: 'Classroom Furniture Repair and Replacement',
        materialCost: 350000,
        laborCost: 150000,
        totalContractAmount: 520000,
        physicalAccomplishment: 100.0,
        powStatus: 'Approved',
        location: 'Multiple Buildings',
        startDate: '2024-06-01',
        endDate: '2024-07-31',
        contractor: 'Campus Maintenance Team',
        category: 'minor-repairs',
        description: 'Repair and replacement of classroom furniture across multiple buildings',
        status: 'Completed',
        progress: 100,
        budgetUtilized: 520000,
        plannedProgress: 100,
        qualityRating: 88,
        safetyRating: 92,
        progressNotes: 'All classroom furniture repairs completed. New ergonomic chairs installed.',
        actualDuration: 61,
        createdAt: '2024-06-01T00:00:00Z',
        updatedAt: '2024-07-31T15:45:00Z',
        createdBy: 'staff@csu.edu.ph',
        lastModifiedBy: 'staff@csu.edu.ph'
      },
      {
        id: 'min-repair-002',
        projectName: 'Electrical Outlet Installation - Library',
        materialCost: 85000,
        laborCost: 45000,
        totalContractAmount: 135000,
        physicalAccomplishment: 94.2,
        powStatus: 'Approved',
        location: 'University Library',
        startDate: '2024-08-15',
        endDate: '2024-09-30',
        contractor: 'ElectroTech Services',
        category: 'minor-repairs',
        description: 'Installation of additional electrical outlets for student study areas',
        status: 'Ongoing',
        progress: 94.2,
        budgetUtilized: 127170,
        plannedProgress: 95,
        qualityRating: 90,
        safetyRating: 94,
        progressNotes: 'Almost complete. Final electrical testing and safety inspection pending.',
        actualDuration: 92,
        createdAt: '2024-08-15T00:00:00Z',
        updatedAt: '2024-11-15T11:20:00Z',
        createdBy: 'staff@csu.edu.ph',
        lastModifiedBy: 'staff@csu.edu.ph'
      },

      // INTERNALLY FUNDED RESEARCH PROJECTS
      {
        id: 'int-research-001',
        projectName: 'Sustainable Agriculture Research Initiative',
        totalContractAmount: 3200000,
        physicalAccomplishment: 68.4,
        powStatus: 'Approved',
        location: 'Agricultural Research Center',
        startDate: '2024-01-15',
        endDate: '2024-12-31',
        contractor: 'CSU Agriculture Department',
        category: 'internally-funded-research',
        description: 'Multi-year research project on sustainable farming practices and crop optimization for Mindanao region',
        status: 'Ongoing',
        progress: 68.4,
        budgetUtilized: 2188800,
        materialCost: 1280000,
        laborCost: 1920000,
        plannedProgress: 70,
        qualityRating: 89,
        safetyRating: 91,
        progressNotes: 'Field trials showing promising results. Data collection on schedule for three crop cycles.',
        actualDuration: 305,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-11-15T13:20:00Z',
        createdBy: 'research@csu.edu.ph',
        lastModifiedBy: 'research@csu.edu.ph'
      },
      {
        id: 'int-research-002',
        projectName: 'Indigenous Knowledge Systems Documentation',
        totalContractAmount: 1800000,
        physicalAccomplishment: 85.2,
        powStatus: 'Approved',
        location: 'Cultural Research Center',
        startDate: '2024-02-01',
        endDate: '2024-11-30',
        contractor: 'CSU Anthropology Department',
        category: 'internally-funded-research',
        description: 'Comprehensive documentation of indigenous knowledge systems in Caraga region',
        status: 'Ongoing',
        progress: 85.2,
        budgetUtilized: 1533600,
        materialCost: 450000,
        laborCost: 1350000,
        plannedProgress: 85,
        qualityRating: 95,
        safetyRating: 98,
        progressNotes: 'Field research completed. Currently in documentation and analysis phase. Community engagement excellent.',
        actualDuration: 287,
        createdAt: '2024-02-01T00:00:00Z',
        updatedAt: '2024-11-15T10:15:00Z',
        createdBy: 'research@csu.edu.ph',
        lastModifiedBy: 'research@csu.edu.ph'
      },
      {
        id: 'int-research-003',
        projectName: 'Marine Biodiversity Assessment - Caraga Coast',
        totalContractAmount: 2500000,
        physicalAccomplishment: 42.8,
        powStatus: 'Approved',
        location: 'Coastal Research Station',
        startDate: '2024-05-01',
        endDate: '2025-04-30',
        contractor: 'CSU Marine Biology Institute',
        category: 'internally-funded-research',
        description: 'Comprehensive assessment of marine biodiversity along Caraga coastal areas',
        status: 'Ongoing',
        progress: 42.8,
        budgetUtilized: 1070000,
        materialCost: 800000,
        laborCost: 1700000,
        plannedProgress: 45,
        qualityRating: 92,
        safetyRating: 94,
        progressNotes: 'Underwater surveys progressing well. Discovered several potentially new species. Weather-dependent schedule.',
        actualDuration: 198,
        createdAt: '2024-05-01T00:00:00Z',
        updatedAt: '2024-11-15T14:30:00Z',
        createdBy: 'research@csu.edu.ph',
        lastModifiedBy: 'research@csu.edu.ph'
      },

      // EXTERNALLY FUNDED RESEARCH PROJECTS
      {
        id: 'ext-research-001',
        projectName: 'Climate Change Adaptation Strategies for Mindanao Farmers',
        totalContractAmount: 8500000,
        physicalAccomplishment: 76.3,
        powStatus: 'Approved',
        location: 'Multiple Field Sites',
        startDate: '2023-08-01',
        endDate: '2024-12-31',
        contractor: 'International Climate Foundation',
        category: 'externally-funded-research',
        description: 'Large-scale research on climate adaptation strategies funded by international climate foundation',
        status: 'Ongoing',
        progress: 76.3,
        budgetUtilized: 6485500,
        materialCost: 3400000,
        laborCost: 5100000,
        plannedProgress: 78,
        qualityRating: 96,
        safetyRating: 93,
        progressNotes: 'Multi-site data collection proceeding well. Community workshops highly successful. International partners satisfied.',
        actualDuration: 471,
        createdAt: '2023-08-01T00:00:00Z',
        updatedAt: '2024-11-15T15:45:00Z',
        createdBy: 'research@csu.edu.ph',
        lastModifiedBy: 'research@csu.edu.ph'
      },
      {
        id: 'ext-research-002',
        projectName: 'Advanced Materials Research for Electronics',
        totalContractAmount: 12000000,
        physicalAccomplishment: 54.7,
        powStatus: 'Approved',
        location: 'Advanced Materials Laboratory',
        startDate: '2024-01-01',
        endDate: '2025-12-31',
        contractor: 'TechGlobal Research Consortium',
        category: 'externally-funded-research',
        description: 'Cutting-edge research on advanced materials for next-generation electronics',
        status: 'Ongoing',
        progress: 54.7,
        budgetUtilized: 6564000,
        materialCost: 4800000,
        laborCost: 7200000,
        plannedProgress: 55,
        qualityRating: 98,
        safetyRating: 96,
        progressNotes: 'Laboratory setup complete. Initial material synthesis showing promising results. Patent applications in process.',
        actualDuration: 319,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-11-15T16:20:00Z',
        createdBy: 'research@csu.edu.ph',
        lastModifiedBy: 'research@csu.edu.ph'
      },

      // EXTENSION PROGRAMS PROJECTS
      {
        id: 'ext-prog-001',
        projectName: 'Digital Literacy Program for Rural Communities',
        totalContractAmount: 2800000,
        physicalAccomplishment: 89.5,
        powStatus: 'Approved',
        location: 'Multiple Rural Barangays',
        startDate: '2024-03-01',
        endDate: '2024-11-30',
        contractor: 'CSU Extension Services',
        category: 'extension-programs',
        description: 'Comprehensive digital literacy training program for rural communities in Caraga region',
        status: 'Ongoing',
        progress: 89.5,
        budgetUtilized: 2506000,
        materialCost: 840000,
        laborCost: 1960000,
        plannedProgress: 90,
        qualityRating: 93,
        safetyRating: 97,
        progressNotes: 'Training modules highly successful. Over 500 community members trained. Excellent community feedback.',
        actualDuration: 259,
        createdAt: '2024-03-01T00:00:00Z',
        updatedAt: '2024-11-15T12:30:00Z',
        createdBy: 'extension@csu.edu.ph',
        lastModifiedBy: 'extension@csu.edu.ph'
      },
      {
        id: 'ext-prog-002',
        projectName: 'Entrepreneurship Development for Women',
        totalContractAmount: 1950000,
        physicalAccomplishment: 72.1,
        powStatus: 'Approved',
        location: 'Community Centers',
        startDate: '2024-04-15',
        endDate: '2024-12-15',
        contractor: 'CSU Business Incubation Center',
        category: 'extension-programs',
        description: 'Business skills training and microenterprise development program for women entrepreneurs',
        status: 'Ongoing',
        progress: 72.1,
        budgetUtilized: 1405950,
        materialCost: 585000,
        laborCost: 1365000,
        plannedProgress: 75,
        qualityRating: 91,
        safetyRating: 95,
        progressNotes: 'Business training workshops well-received. 15 new microenterprises established. Mentorship program active.',
        actualDuration: 214,
        createdAt: '2024-04-15T00:00:00Z',
        updatedAt: '2024-11-15T11:45:00Z',
        createdBy: 'extension@csu.edu.ph',
        lastModifiedBy: 'extension@csu.edu.ph'
      },
      {
        id: 'ext-prog-003',
        projectName: 'Sustainable Fisheries Management Training',
        totalContractAmount: 2200000,
        physicalAccomplishment: 63.8,
        powStatus: 'Approved',
        location: 'Coastal Communities',
        startDate: '2024-06-01',
        endDate: '2025-01-31',
        contractor: 'CSU Marine Sciences Extension',
        category: 'extension-programs',
        description: 'Training program for sustainable fisheries management practices in coastal communities',
        status: 'Ongoing',
        progress: 63.8,
        budgetUtilized: 1403600,
        materialCost: 660000,
        laborCost: 1540000,
        plannedProgress: 65,
        qualityRating: 88,
        safetyRating: 92,
        progressNotes: 'Fishermen training ongoing. Sustainable practices being adopted. Marine sanctuary proposals developed.',
        actualDuration: 167,
        createdAt: '2024-06-01T00:00:00Z',
        updatedAt: '2024-11-15T13:15:00Z',
        createdBy: 'extension@csu.edu.ph',
        lastModifiedBy: 'extension@csu.edu.ph'
      },

      // GENDER AND DEVELOPMENT PROJECTS
      {
        id: 'gad-001',
        projectName: 'Women Leadership Development Program',
        totalContractAmount: 1800000,
        physicalAccomplishment: 81.7,
        powStatus: 'Approved',
        location: 'Community Extension Center',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        contractor: 'Gender Development Partners',
        category: 'gender-development',
        description: 'Comprehensive leadership development program for women in academic and community settings',
        status: 'Ongoing',
        progress: 81.7,
        budgetUtilized: 1470600,
        materialCost: 540000,
        laborCost: 1260000,
        plannedProgress: 83,
        qualityRating: 96,
        safetyRating: 98,
        progressNotes: 'Leadership seminars highly successful. Women leaders network established. Mentorship program thriving.',
        actualDuration: 318,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-11-15T09:45:00Z',
        createdBy: 'gad@csu.edu.ph',
        lastModifiedBy: 'gad@csu.edu.ph'
      },
      {
        id: 'gad-002',
        projectName: 'Gender-Responsive Budgeting Training',
        totalContractAmount: 950000,
        physicalAccomplishment: 94.2,
        powStatus: 'Approved',
        location: 'Administrative Offices',
        startDate: '2024-02-15',
        endDate: '2024-10-31',
        contractor: 'CSU GAD Office',
        category: 'gender-development',
        description: 'Training program on gender-responsive budgeting for university administrators and staff',
        status: 'Ongoing',
        progress: 94.2,
        budgetUtilized: 894900,
        materialCost: 285000,
        laborCost: 665000,
        plannedProgress: 95,
        qualityRating: 92,
        safetyRating: 96,
        progressNotes: 'Training modules completed. Budget revision guidelines developed. Implementation protocols established.',
        actualDuration: 259,
        createdAt: '2024-02-15T00:00:00Z',
        updatedAt: '2024-11-15T14:10:00Z',
        createdBy: 'gad@csu.edu.ph',
        lastModifiedBy: 'gad@csu.edu.ph'
      },
      {
        id: 'gad-003',
        projectName: 'Safe Spaces Initiative for Campus',
        totalContractAmount: 1350000,
        physicalAccomplishment: 76.8,
        powStatus: 'Approved',
        location: 'University Campus',
        startDate: '2024-03-01',
        endDate: '2024-12-31',
        contractor: 'Campus Safety Consultants',
        category: 'gender-development',
        description: 'Implementation of safe spaces and anti-harassment measures across university campus',
        status: 'Ongoing',
        progress: 76.8,
        budgetUtilized: 1036800,
        materialCost: 405000,
        laborCost: 945000,
        plannedProgress: 78,
        qualityRating: 89,
        safetyRating: 97,
        progressNotes: 'Safety infrastructure installed. Awareness campaigns active. Reporting mechanisms established.',
        actualDuration: 259,
        createdAt: '2024-03-01T00:00:00Z',
        updatedAt: '2024-11-15T15:25:00Z',
        createdBy: 'gad@csu.edu.ph',
        lastModifiedBy: 'gad@csu.edu.ph'
      },

      // OPERATIONAL PROJECTS (University Operations)
      {
        id: 'ops-001',
        projectName: 'Campus Information Management System Upgrade',
        totalContractAmount: 4200000,
        physicalAccomplishment: 67.3,
        powStatus: 'Approved',
        location: 'IT Center',
        startDate: '2024-02-01',
        endDate: '2024-11-30',
        contractor: 'TechSolutions Inc.',
        category: 'operational-projects',
        description: 'Comprehensive upgrade of campus information management systems and digital infrastructure',
        status: 'Ongoing',
        progress: 67.3,
        budgetUtilized: 2826600,
        materialCost: 2100000,
        laborCost: 2100000,
        plannedProgress: 70,
        qualityRating: 91,
        safetyRating: 93,
        progressNotes: 'System integration proceeding well. Database migration 80% complete. User training scheduled.',
        actualDuration: 287,
        createdAt: '2024-02-01T00:00:00Z',
        updatedAt: '2024-11-15T16:15:00Z',
        createdBy: 'it@csu.edu.ph',
        lastModifiedBy: 'it@csu.edu.ph'
      },
      {
        id: 'ops-002',
        projectName: 'Fleet Management and Transportation Services',
        totalContractAmount: 3800000,
        physicalAccomplishment: 58.9,
        powStatus: 'Approved',
        location: 'Transportation Hub',
        startDate: '2024-04-01',
        endDate: '2025-01-31',
        contractor: 'Fleet Management Solutions',
        category: 'operational-projects',
        description: 'Implementation of comprehensive fleet management system for university transportation',
        status: 'Ongoing',
        progress: 58.9,
        budgetUtilized: 2238200,
        materialCost: 1520000,
        laborCost: 2280000,
        plannedProgress: 60,
        qualityRating: 87,
        safetyRating: 94,
        progressNotes: 'GPS tracking systems installed. Maintenance schedules optimized. Driver training ongoing.',
        actualDuration: 228,
        createdAt: '2024-04-01T00:00:00Z',
        updatedAt: '2024-11-15T12:45:00Z',
        createdBy: 'admin@csu.edu.ph',
        lastModifiedBy: 'admin@csu.edu.ph'
      },

      // ADMINISTRATIVE SUPPORT PROJECTS
      {
        id: 'admin-001',
        projectName: 'Document Management System Implementation',
        totalContractAmount: 2100000,
        physicalAccomplishment: 83.6,
        powStatus: 'Approved',
        location: 'Administrative Offices',
        startDate: '2024-01-15',
        endDate: '2024-10-31',
        contractor: 'DocuFlow Systems',
        category: 'administrative-support',
        description: 'Implementation of digital document management system for administrative efficiency',
        status: 'Ongoing',
        progress: 83.6,
        budgetUtilized: 1755600,
        materialCost: 840000,
        laborCost: 1260000,
        plannedProgress: 85,
        qualityRating: 94,
        safetyRating: 96,
        progressNotes: 'System deployment near completion. User training highly successful. Document digitization 90% done.',
        actualDuration: 304,
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-11-15T10:50:00Z',
        createdBy: 'admin@csu.edu.ph',
        lastModifiedBy: 'admin@csu.edu.ph'
      },
      {
        id: 'admin-002',
        projectName: 'HR Information System Modernization',
        totalContractAmount: 1650000,
        physicalAccomplishment: 91.4,
        powStatus: 'Approved',
        location: 'Human Resources Office',
        startDate: '2024-03-15',
        endDate: '2024-11-15',
        contractor: 'HRTech Solutions',
        category: 'administrative-support',
        description: 'Modernization of human resources information systems and processes',
        status: 'Ongoing',
        progress: 91.4,
        budgetUtilized: 1508100,
        materialCost: 495000,
        laborCost: 1155000,
        plannedProgress: 92,
        qualityRating: 95,
        safetyRating: 97,
        progressNotes: 'System testing completed successfully. Final user acceptance testing in progress. Go-live scheduled.',
        actualDuration: 245,
        createdAt: '2024-03-15T00:00:00Z',
        updatedAt: '2024-11-15T11:35:00Z',
        createdBy: 'hr@csu.edu.ph',
        lastModifiedBy: 'hr@csu.edu.ph'
      }
    ];

    // Store projects with enhanced variance calculations
    sampleProjects.forEach(project => {
      // Calculate and store variance data
      const varianceData = calculateProjectVariance(project);
      const enhancedProject = {
        ...project,
        expectedProgressValue: varianceData.expectedProgressValue,
        budgetVariance: varianceData.budgetVariance,
        variancePercentage: varianceData.variancePercentage,
        varianceStatus: varianceData.varianceStatus
      };
      
      this.projects.set(project.id, enhancedProject);
      
      // Initialize sample documents for each project
      this.documents.set(project.id, [
        {
          id: `doc-${project.id}-1`,
          projectId: project.id,
          name: 'Project Proposal.pdf',
          size: '2.1 MB',
          type: 'proposal',
          uploadDate: project.startDate,
          uploadedBy: project.createdBy
        },
        {
          id: `doc-${project.id}-2`,
          projectId: project.id,
          name: 'Budget Breakdown.xlsx',
          size: '890 KB',
          type: 'budget',
          uploadDate: project.startDate,
          uploadedBy: project.createdBy
        },
        {
          id: `doc-${project.id}-3`,
          projectId: project.id,
          name: 'Progress Report.pdf',
          size: '1.5 MB',
          type: 'report',
          uploadDate: project.updatedAt.split('T')[0],
          uploadedBy: project.lastModifiedBy
        }
      ]);

      // Initialize sample photos for each project
      this.photos.set(project.id, [
        {
          id: `photo-${project.id}-1`,
          projectId: project.id,
          name: 'Project Kickoff.jpg',
          description: 'Project kickoff ceremony and groundbreaking',
          uploadDate: project.startDate,
          uploadedBy: project.createdBy
        },
        {
          id: `photo-${project.id}-2`,
          projectId: project.id,
          name: 'Current Progress.jpg',
          description: 'Latest progress documentation',
          uploadDate: project.updatedAt.split('T')[0],
          uploadedBy: project.lastModifiedBy
        },
        {
          id: `photo-${project.id}-3`,
          projectId: project.id,
          name: 'Team Meeting.jpg',
          description: 'Project team coordination meeting',
          uploadDate: project.updatedAt.split('T')[0],
          uploadedBy: project.lastModifiedBy
        }
      ]);

      // Initialize detailed budget items for each project
      this.budgetItems.set(project.id, [
        {
          id: `budget-${project.id}-1`,
          projectId: project.id,
          category: 'Materials',
          allocatedAmount: project.materialCost || (project.totalContractAmount * 0.60),
          utilizedAmount: (project.materialCost || (project.totalContractAmount * 0.60)) * (project.physicalAccomplishment / 100),
          description: 'Raw materials, equipment, and supplies'
        },
        {
          id: `budget-${project.id}-2`,
          projectId: project.id,
          category: 'Labor',
          allocatedAmount: project.laborCost || (project.totalContractAmount * 0.25),
          utilizedAmount: (project.laborCost || (project.totalContractAmount * 0.25)) * (project.physicalAccomplishment / 100),
          description: 'Skilled and unskilled labor costs'
        },
        {
          id: `budget-${project.id}-3`,
          projectId: project.id,
          category: 'Equipment',
          allocatedAmount: project.totalContractAmount * 0.10,
          utilizedAmount: (project.totalContractAmount * 0.10) * (project.physicalAccomplishment / 100),
          description: 'Equipment rental and specialized tools'
        },
        {
          id: `budget-${project.id}-4`,
          projectId: project.id,
          category: 'Administrative',
          allocatedAmount: project.totalContractAmount * 0.05,
          utilizedAmount: (project.totalContractAmount * 0.05) * (project.physicalAccomplishment / 100),
          description: 'Administrative costs and project management'
        }
      ]);
    });
  }

  // Enhanced Project CRUD operations with variance tracking
  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Project> {
    const id = `${projectData.category}-${Date.now()}`;
    const now = new Date().toISOString();
    
    const newProject: Project = {
      ...projectData,
      id,
      progress: projectData.physicalAccomplishment,
      budgetUtilized: (projectData.totalContractAmount * projectData.physicalAccomplishment) / 100,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      lastModifiedBy: userId
    };

    // Calculate and add variance data
    const varianceData = calculateProjectVariance(newProject);
    newProject.expectedProgressValue = varianceData.expectedProgressValue;
    newProject.budgetVariance = varianceData.budgetVariance;
    newProject.variancePercentage = varianceData.variancePercentage;
    newProject.varianceStatus = varianceData.varianceStatus;

    this.projects.set(id, newProject);
    this.documents.set(id, []);
    this.photos.set(id, []);
    this.budgetItems.set(id, []);

    console.log('Project created:', newProject);
    return newProject;
  }

  async getProject(id: string): Promise<Project | null> {
    const project = this.projects.get(id) || null;
    if (project) {
      console.log('Project retrieved:', project.projectName);
    }
    return project;
  }

  async getProjectsByCategory(category: string): Promise<Project[]> {
    const projects = Array.from(this.projects.values()).filter(project => project.category === category);
    console.log(`Retrieved ${projects.length} projects for category: ${category}`);
    return projects;
  }

  async getAllProjects(): Promise<Project[]> {
    const projects = Array.from(this.projects.values());
    console.log(`Retrieved ${projects.length} total projects`);
    return projects;
  }

  async updateProject(id: string, updates: Partial<Project>, userId: string): Promise<Project | null> {
    const existingProject = this.projects.get(id);
    if (!existingProject) {
      console.log('Project not found for update:', id);
      return null;
    }

    const updatedProject: Project = {
      ...existingProject,
      ...updates,
      updatedAt: new Date().toISOString(),
      lastModifiedBy: userId
    };

    // Recalculate variance if relevant fields were updated
    if (updates.physicalAccomplishment !== undefined || 
        updates.budgetUtilized !== undefined || 
        updates.totalContractAmount !== undefined) {
      const varianceData = calculateProjectVariance(updatedProject);
      updatedProject.expectedProgressValue = varianceData.expectedProgressValue;
      updatedProject.budgetVariance = varianceData.budgetVariance;
      updatedProject.variancePercentage = varianceData.variancePercentage;
      updatedProject.varianceStatus = varianceData.varianceStatus;
    }

    this.projects.set(id, updatedProject);
    console.log('Project updated:', updatedProject.projectName);
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    const project = this.projects.get(id);
    const deleted = this.projects.delete(id);
    if (deleted) {
      this.documents.delete(id);
      this.photos.delete(id);
      this.budgetItems.delete(id);
      console.log('Project deleted:', project?.projectName);
    }
    return deleted;
  }

  // Document operations
  async addDocument(projectId: string, document: Omit<ProjectDocument, 'id'>, userId: string): Promise<ProjectDocument> {
    const id = `doc-${projectId}-${Date.now()}`;
    const newDocument: ProjectDocument = {
      ...document,
      id,
      uploadedBy: userId
    };

    const projectDocs = this.documents.get(projectId) || [];
    projectDocs.push(newDocument);
    this.documents.set(projectId, projectDocs);

    return newDocument;
  }

  async getDocuments(projectId: string): Promise<ProjectDocument[]> {
    return this.documents.get(projectId) || [];
  }

  async deleteDocument(projectId: string, documentId: string): Promise<boolean> {
    const projectDocs = this.documents.get(projectId) || [];
    const filteredDocs = projectDocs.filter(doc => doc.id !== documentId);
    this.documents.set(projectId, filteredDocs);
    return filteredDocs.length < projectDocs.length;
  }

  // Photo operations
  async addPhoto(projectId: string, photo: Omit<ProjectPhoto, 'id'>, userId: string): Promise<ProjectPhoto> {
    const id = `photo-${projectId}-${Date.now()}`;
    const newPhoto: ProjectPhoto = {
      ...photo,
      id,
      uploadedBy: userId
    };

    const projectPhotos = this.photos.get(projectId) || [];
    projectPhotos.push(newPhoto);
    this.photos.set(projectId, projectPhotos);

    return newPhoto;
  }

  async getPhotos(projectId: string): Promise<ProjectPhoto[]> {
    return this.photos.get(projectId) || [];
  }

  async deletePhoto(projectId: string, photoId: string): Promise<boolean> {
    const projectPhotos = this.photos.get(projectId) || [];
    const filteredPhotos = projectPhotos.filter(photo => photo.id !== photoId);
    this.photos.set(projectId, filteredPhotos);
    return filteredPhotos.length < projectPhotos.length;
  }

  // Budget operations
  async getBudgetItems(projectId: string): Promise<BudgetItem[]> {
    return this.budgetItems.get(projectId) || [];
  }

  async addBudgetItem(projectId: string, budgetItem: Omit<BudgetItem, 'id'>): Promise<BudgetItem> {
    const id = `budget-${projectId}-${Date.now()}`;
    const newBudgetItem: BudgetItem = {
      ...budgetItem,
      id
    };

    const projectBudgetItems = this.budgetItems.get(projectId) || [];
    projectBudgetItems.push(newBudgetItem);
    this.budgetItems.set(projectId, projectBudgetItems);

    return newBudgetItem;
  }
}

// Global instance
const dataStore = new ProjectDataStore();

// Enhanced API with better error handling and logging
export const ProjectAPI = {
  // Project operations
  createProject: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>, userId: string = 'system') => 
    dataStore.createProject(projectData, userId),
  
  getProject: (id: string) => dataStore.getProject(id),
  
  updateProject: (id: string, updates: Partial<Project>, userId: string = 'system') => 
    dataStore.updateProject(id, updates, userId),
  
  deleteProject: (id: string) => dataStore.deleteProject(id),
  
  // Document operations
  addDocument: (projectId: string, document: Omit<ProjectDocument, 'id'>, userId: string = 'system') => 
    dataStore.addDocument(projectId, document, userId),
  
  getDocuments: (projectId: string) => dataStore.getDocuments(projectId),
  
  deleteDocument: (projectId: string, documentId: string) => 
    dataStore.deleteDocument(projectId, documentId),
  
  // Photo operations
  addPhoto: (projectId: string, photo: Omit<ProjectPhoto, 'id'>, userId: string = 'system') => 
    dataStore.addPhoto(projectId, photo, userId),
  
  getPhotos: (projectId: string) => dataStore.getPhotos(projectId),
  
  deletePhoto: (projectId: string, photoId: string) => 
    dataStore.deletePhoto(projectId, photoId),
  
  // Budget operations
  getBudgetItems: (projectId: string) => dataStore.getBudgetItems(projectId),
  
  addBudgetItem: (projectId: string, budgetItem: Omit<BudgetItem, 'id'>) => 
    dataStore.addBudgetItem(projectId, budgetItem),
  
  // Utility functions
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount >= 1000000 ? 'compact' : 'standard',
      compactDisplay: 'short'
    }).format(amount);
  },
  
  getStatusColor: (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ongoing':
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on hold':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  },
  
  calculateVariance: calculateProjectVariance
};

// Main export functions for backward compatibility
export const getAllProjects = () => dataStore.getAllProjects();
export const getProjectsByCategory = (category: string) => dataStore.getProjectsByCategory(category);

export const getProjectStats = async () => {
  const projects = await getAllProjects();
  
  const stats = {
    totalProjects: projects.length,
    totalBudget: projects.reduce((sum, p) => sum + p.totalContractAmount, 0),
    totalUtilized: projects.reduce((sum, p) => sum + (p.budgetUtilized || 0), 0),
    averageProgress: projects.length > 0 ? projects.reduce((sum, p) => sum + p.physicalAccomplishment, 0) / projects.length : 0,
    statusBreakdown: projects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as { [status: string]: number }),
    categoryBreakdown: projects.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as { [category: string]: number })
  };
  
  return stats;
};

export default ProjectAPI;