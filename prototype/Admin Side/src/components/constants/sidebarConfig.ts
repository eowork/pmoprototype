import { 
  BarChart3, 
  Building, 
  Wrench, 
  HardHat, 
  FileText, 
  Users, 
  Heart, 
  Download,
  Settings,
  UserCheck,
  Info,
  Home,
  GraduationCap,
  BookOpen,
  FlaskConical,
  Lightbulb,
  Calendar,
  MapPin,
  DollarSign,
  Target,
  Award,
  Briefcase,
  Phone,
  Mail,
  FileCheck,
  Building2,
  Hammer,
  PaintBucket,
  Search,
  Users2,
  FileSignature,
  Scale,
  TrendingUp,
  PieChart,
  School,
  ClipboardCheck,
  Minus // Add Minus icon for dividers
} from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  icon: any;
  type: 'page' | 'category' | 'divider';
  children?: SidebarItem[];
  isExpanded?: boolean;
  badge?: string;
  description?: string;
  page?: string; // Add page property for navigation
}

export const sidebarConfig: SidebarItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    type: 'page',
    page: 'home',
    description: 'Return to the main landing page'
  },
  {
    id: 'overview',
    label: 'Dashboard Overview',
    icon: BarChart3,
    type: 'page',
    page: 'overview',
    description: 'Main dashboard with analytics and project summaries'
  },
  {
    id: 'about-us',
    label: 'About Us',
    icon: Info,
    type: 'category',
    page: 'about-us',
    isExpanded: false,
    description: 'Organization information and contacts',
    children: [
      {
        id: 'personnel-org-chart',
        label: 'Personnel & Org Chart',
        icon: Users2,
        type: 'page',
        page: 'personnel-org-chart',
        description: 'Staff directory and organizational structure'
      },
      {
        id: 'office-objectives',
        label: 'Office Objectives',
        icon: Target,
        type: 'page',
        page: 'office-objectives',
        description: 'Mission, vision, and strategic objectives'
      },
      {
        id: 'pmo-contact-details',
        label: 'PMO Contact Details',
        icon: Phone,
        type: 'page',
        page: 'pmo-contact-details',
        description: 'Contact information and office locations'
      }
    ]
  },
  {
    id: 'university-operations',
    label: 'University Operations',
    icon: GraduationCap,
    type: 'category',
    page: 'university-operations',
    isExpanded: false,
    description: 'Academic and operational programs',
    children: [
      {
        id: 'university-operations-overview',
        label: 'Overview',
        icon: BarChart3,
        type: 'page',
        page: 'university-operations-overview',
        description: 'Comprehensive overview of all university operations'
      },
      {
        id: 'higher-education-program',
        label: 'Higher Education Program',
        icon: BookOpen,
        type: 'page',
        page: 'higher-education-program',
        description: 'Undergraduate and graduate programs management'
      },
      {
        id: 'advanced-education-program',
        label: 'Advanced Education Program',
        icon: Award,
        type: 'page',
        page: 'advanced-education-program',
        description: 'Advanced degrees and specialized programs'
      },
      {
        id: 'research-program',
        label: 'Research Program',
        icon: FlaskConical,
        type: 'page',
        page: 'research-program',
        description: 'Research initiatives and projects'
      },
      {
        id: 'technical-advisory-extension-program',
        label: 'Technical Advisory Extension Program',
        icon: Lightbulb,
        type: 'page',
        page: 'technical-advisory-extension-program',
        description: 'Community outreach and technical assistance'
      }
    ]
  },
  {
    id: 'construction-of-infrastructure',
    label: 'Construction of Infrastructure',
    icon: Building,
    type: 'category',
    page: 'construction-of-infrastructure',
    isExpanded: false,
    description: 'Infrastructure development and construction projects',
    children: [
      {
        id: 'construction-overview',
        label: 'Overview',
        icon: BarChart3,
        type: 'page',
        page: 'construction-overview',
        description: 'Comprehensive overview of all construction and infrastructure projects'
      },
      {
        id: 'gaa-funded-projects',
        label: 'GAA-Funded Projects (National Government)',
        icon: Building2,
        type: 'page',
        page: 'gaa-funded-projects',
        description: 'Government-funded infrastructure development'
      },
      {
        id: 'locally-funded-projects',
        label: 'Locally-Funded Projects',
        icon: MapPin,
        type: 'page',
        page: 'locally-funded-projects',
        description: 'Local government and community-funded projects'
      },
      {
        id: 'special-grants-projects',
        label: 'Special Grants/ Partnerships/ Income-Generating Projects',
        icon: Award,
        type: 'page',
        page: 'special-grants-projects',
        description: 'Special funding, partnerships, and revenue-generating projects'
      }
    ]
  },
  {
    id: 'facilities-assessment',
    label: 'Facilities Assessment',
    icon: School,
    type: 'category',
    page: 'facilities-assessment',
    isExpanded: false,
    description: 'Comprehensive facilities space assessment and evaluation management',
    children: [
      {
        id: 'facilities-assessment-overview',
        label: 'Overview',
        icon: BarChart3,
        type: 'page',
        page: 'facilities-assessment-overview',
        description: 'Comprehensive overview of all facilities assessment categories'
      },
      {
        id: 'classroom-csu-main-cc',
        label: 'Classroom Assessment',
        icon: Building2,
        type: 'page',
        page: 'classroom-csu-main-cc',
        description: 'Classroom space assessments and evaluations'
      },
      {
        id: 'laboratory-assessment',
        label: 'Laboratory Assessment',
        icon: FlaskConical,
        type: 'page',
        page: 'laboratory-assessment',
        description: 'Laboratory facilities safety and assessment evaluations'
      },
      {
        id: 'admin-office-csu-main-cc',
        label: 'Administrative Office Assessment',
        icon: Briefcase,
        type: 'page',
        page: 'admin-office-csu-main-cc',
        description: 'Administrative office space assessments'
      },
      {
        id: 'prioritization-matrix',
        label: 'Prioritization Matrix',
        icon: ClipboardCheck,
        type: 'page',
        page: 'prioritization-matrix',
        description: 'Facilities improvement prioritization matrix'
      }
    ]
  },
  {
    id: 'repairs',
    label: 'Repairs',
    icon: Wrench,
    color: 'orange',
    page: 'repairs',
    description: 'Major and Minor repair projects for CSU facilities',
    subItems: [
      {
        id: 'repairs-overview',
        label: 'Overview',
        icon: TrendingUp,
        page: 'repairs',
        description: 'Overview of all repairs projects'
      },
      {
        id: 'major-repairs',
        label: 'Major Repairs',
        icon: HardHat,
        page: 'major-repairs',
        description: 'Structural and significant facility repairs'
      },
      {
        id: 'minor-repairs',
        label: 'Minor Repairs',
        icon: Wrench,
        page: 'minor-repairs',
        description: 'Routine and cosmetic repairs'
      }
    ]
  },
  {
    id: 'policies',
    label: 'Policies',
    icon: FileText,
    type: 'category',
    page: 'policies',
    isExpanded: false,
    description: 'Institutional policies and agreements',
    children: [
      {
        id: 'policies-overview',
        label: 'Overview',
        icon: BarChart3,
        type: 'page',
        page: 'policies-overview',
        description: 'Comprehensive overview of all institutional policies and agreements'
      },
      {
        id: 'memorandum-of-agreements',
        label: 'Memorandum of Agreements',
        icon: FileSignature,
        type: 'page',
        page: 'memorandum-of-agreements',
        description: 'MOAs and partnership agreements'
      },
      {
        id: 'memorandum-of-understanding',
        label: 'Memorandum of Understanding',
        icon: Scale,
        type: 'page',
        page: 'memorandum-of-understanding',
        description: 'MOUs and collaborative agreements'
      }
    ]
  },
  {
    id: 'gad-parity-knowledge-management',
    label: 'GAD Parity and Knowledge Management',
    icon: Heart,
    type: 'category',
    page: 'gad-parity-knowledge-management',
    isExpanded: false,
    description: 'Gender and Development reports, analytics, and knowledge management',
    children: [
      {
        id: 'gad-overview',
        label: 'Overview',
        icon: BarChart3,
        type: 'page',
        page: 'gad-overview',
        description: 'Comprehensive overview of all GAD parity and knowledge management activities'
      },
      {
        id: 'gender-parity-report',
        label: 'Gender Parity Report',
        icon: Users,
        type: 'page',
        page: 'gender-parity-report',
        description: 'Comprehensive gender distribution analysis across students, faculty, staff, PWD, and indigenous people'
      },
      {
        id: 'gpb-accomplishment',
        label: 'GPB Accomplishment',
        icon: Target,
        type: 'page',
        page: 'gpb-accomplishment',
        description: 'Gender and Development Budget accomplishments'
      },
      {
        id: 'gad-budget-and-plans',
        label: 'GAD Budget and Plans',
        icon: PieChart,
        type: 'page',
        page: 'gad-budget-and-plans',
        description: 'GAD financial planning and allocation'
      }
    ]
  },
  {
    id: 'forms',
    label: 'Downloadable Forms',
    icon: Download,
    type: 'category',
    page: 'forms',
    isExpanded: false,
    description: 'Official forms and templates',
    children: [
      {
        id: 'forms-overview',
        label: 'Overview',
        icon: BarChart3,
        type: 'page',
        page: 'forms-overview',
        description: 'Comprehensive overview of all downloadable forms and templates'
      },
      {
        id: 'forms-inventory',
        label: 'Inventory',
        icon: FileCheck,
        type: 'page',
        page: 'forms-inventory',
        description: 'Manage and organize form inventory with full CRUD functionality'
      }
    ]
  }
];

// Category mappings for backward compatibility and routing
export const categoryMapping: Record<string, string> = {
  'operational-projects': 'higher-education-program',
  'administrative-support': 'higher-education-program',
  'infrastructure': 'construction',
  'construction-of-infrastructure': 'construction',
  'gaa-funded-projects': 'gaa-funded-projects', // Direct mapping for GAA page
  'locally-funded-projects': 'locally-funded-projects', // Direct mapping for Locally-Funded page
  'special-grants-projects': 'special-grants-projects', // Direct mapping for Special Grants page
  'classroom-administrative-offices': 'classroom-administrative-offices', // Direct mapping for Classroom & Administrative Offices
  'classroom-csu-main-cc': 'classroom-administrative-offices',
  'admin-office-csu-main-cc': 'classroom-administrative-offices',
  'prioritization-matrix': 'classroom-administrative-offices',
  'classrooms-csu-cc-bxu': 'repairs',
  'administrative-offices-csu-cc-bxu': 'repairs',
  'memorandum-of-agreements': 'policies',
  'memorandum-of-understanding': 'policies',
  // Updated GAD mapping
  'gad-parity-report': 'gad-parity-knowledge-management', // Backward compatibility
  'gender-parity-admission-rate': 'gad-parity-knowledge-management',
  'gender-parity-graduation-rate': 'gad-parity-knowledge-management',
  'gpb-accomplishment': 'gad-parity-knowledge-management',
  'gad-budget-and-plans': 'gad-parity-knowledge-management',
  'hgdg-16-sectoral-forms': 'forms',
  'pimme-checklist': 'forms',
  'pmo-monthly-accomplishment-form': 'forms',
  'evaluation-plan': 'forms',
  'monitoring-plan': 'forms',
  'csu-me-plan': 'forms',
  'forms-inventory': 'forms',
  'personnel-org-chart': 'about-us',
  'office-objectives': 'about-us',
  'pmo-contact-details': 'about-us',
  // Add new overview page mappings
  'university-operations-overview': 'university-operations',
  'construction-overview': 'construction-of-infrastructure',
  'classroom-admin-overview': 'classroom-administrative-offices',
  'repairs-overview': 'repairs', // Routes to professional RepairsCategoryOverview
  'policies-overview': 'policies',
  'gad-overview': 'gad-parity-knowledge-management',
  'forms-overview': 'forms'
};

// Get category display name function
export const getCategoryDisplayName = (categoryId: string): string => {
  const displayNames: Record<string, string> = {
    'construction': 'Construction Projects',
    'repairs': 'Repair Projects', 
    'fabrications': 'Fabrication Projects',
    'internally-funded-research': 'Internally Funded Research',
    'externally-funded-research': 'Externally Funded Research',
    'extension-programs': 'Extension Programs',
    'gender-development': 'Gender & Development',
    'operational-projects': 'Operational Projects',
    'administrative-support': 'Administrative Support',
    'higher-education-program': 'Higher Education Program',
    'advanced-education-program': 'Advanced Education Program',
    'research-program': 'Research Program',
    'technical-advisory-extension-program': 'Technical Advisory Extension Program',
    'gaa-funded-projects': 'GAA-Funded Projects (National Government)',
    'locally-funded-projects': 'Locally-Funded Projects',
    'special-grants-projects': 'Special Grants/ Partnerships/ Income-Generating Projects',
    'classroom-administrative-offices': 'Classroom & Administrative Offices',
    'classroom-csu-main-cc': 'Classroom (CSU Main & CSU CC)',
    'admin-office-csu-main-cc': 'Administrative Office (CSU Main & CSU CC)',
    'prioritization-matrix': 'Prioritization Matrix',
    'classrooms-csu-cc-bxu': 'Classrooms (CSU-CC-BXU)',
    'administrative-offices-csu-cc-bxu': 'Administrative Offices (CSU-CC-BXU)'
  };
  
  return displayNames[categoryId] || categoryId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// University Forms constants for FormsPage
export const UNIVERSITY_FORMS = [
  {
    id: 'hgdg-16-sectoral-forms',
    title: 'HGDG-16 Sectoral Forms',
    description: 'Sectoral reporting forms for gender and development',
    category: 'GAD Reporting',
    downloadUrl: '#',
    fileSize: '2.1 MB',
    lastUpdated: '2024-01-15'
  },
  {
    id: 'pimme-checklist', 
    title: 'PIMME Checklist',
    description: 'Project implementation monitoring and evaluation checklist',
    category: 'Project Monitoring',
    downloadUrl: '#',
    fileSize: '1.8 MB',
    lastUpdated: '2024-01-10'
  },
  {
    id: 'pmo-monthly-accomplishment-form',
    title: 'PMO Monthly Accomplishment Form',
    description: 'Monthly progress reporting forms for project management office',
    category: 'Progress Reporting',
    downloadUrl: '#',
    fileSize: '1.5 MB',
    lastUpdated: '2024-01-05'
  },
  {
    id: 'evaluation-plan',
    title: 'Evaluation Plan Template',
    description: 'Template for project evaluation planning and assessment',
    category: 'Evaluation',
    downloadUrl: '#',
    fileSize: '2.3 MB',
    lastUpdated: '2023-12-20'
  },
  {
    id: 'monitoring-plan',
    title: 'Monitoring Plan Template', 
    description: 'Template for project monitoring plans and frameworks',
    category: 'Monitoring',
    downloadUrl: '#',
    fileSize: '2.0 MB', 
    lastUpdated: '2023-12-18'
  },
  {
    id: 'csu-me-plan',
    title: 'CSU M&E Plan Framework',
    description: 'Comprehensive monitoring and evaluation plan framework for CSU',
    category: 'M&E Framework',
    downloadUrl: '#',
    fileSize: '3.2 MB',
    lastUpdated: '2023-12-15'
  }
];

export const FORM_CATEGORIES = [
  'All Categories',
  'GAD Reporting',
  'Project Monitoring', 
  'Progress Reporting',
  'Evaluation',
  'Monitoring',
  'M&E Framework'
];

// Admin sidebar items configuration
export const adminSidebarItems = [
  {
    id: 'users',
    label: 'User Management',
    icon: Users,
    type: 'page',
    page: 'users',
    adminOnly: true,
    description: 'Manage user accounts and permissions'
  },
  {
    id: 'settings',
    label: 'System Settings',
    icon: Settings,
    type: 'page',
    page: 'settings',
    requiresAuth: true,
    description: 'Application settings and configuration'
  }
];

// Role color mapping function
export const getRoleColor = (role: string): string => {
  const roleColors: Record<string, string> = {
    'Admin': 'bg-red-100 text-red-800 border-red-200',
    'Staff': 'bg-blue-100 text-blue-800 border-blue-200', 
    'Client': 'bg-green-100 text-green-800 border-green-200',
    'Viewer': 'bg-gray-100 text-gray-800 border-gray-200'
  };
  
  return roleColors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Get all pages under a specific category
export const getCategoryPages = (categoryId: string): SidebarItem[] => {
  const category = sidebarConfig.find(item => item.id === categoryId);
  return category?.children || [];
};

// Get page title by ID
export const getPageTitle = (pageId: string): string => {
  for (const item of sidebarConfig) {
    if (item.id === pageId) {
      return item.label;
    }
    if (item.children) {
      for (const child of item.children) {
        if (child.id === pageId) {
          return child.label;
        }
      }
    }
  }
  return 'Dashboard';
};

// Get breadcrumb path for a page
export const getBreadcrumbPath = (pageId: string): string[] => {
  for (const item of sidebarConfig) {
    if (item.id === pageId) {
      return [item.label];
    }
    if (item.children) {
      for (const child of item.children) {
        if (child.id === pageId) {
          return [item.label, child.label];
        }
      }
    }
  }
  return ['Dashboard'];
};

// Check if user has access to a specific page based on role
export const hasPageAccess = (pageId: string, userRole: string): boolean => {
  // Everyone can access most pages (view-only for clients)
  // Only restrict user management to Admin
  if (pageId === 'users' && userRole !== 'Admin') {
    return false;
  }
  
  // Settings page requires authentication but any role can access
  if (pageId === 'settings' && userRole === 'Client') {
    return false;
  }
  
  return true;
};

// Get pages that require authentication
export const getAuthRequiredPages = (): string[] => {
  return ['users', 'settings'];
};

// Get pages that are admin-only
export const getAdminOnlyPages = (): string[] => {
  return ['users'];
};

// Helper function to get all sidebar items (including admin items for admin users)
export const getAllSidebarItems = (userRole: string): SidebarItem[] => {
  const items = [...sidebarConfig];
  
  if (userRole === 'Admin') {
    // Add admin-only items
    adminSidebarItems.forEach(adminItem => {
      items.push(adminItem as SidebarItem);
    });
  }
  
  return items;
};

// Helper function to check if a page is a subcategory
export const isSubcategoryPage = (pageId: string): boolean => {
  for (const item of sidebarConfig) {
    if (item.children) {
      for (const child of item.children) {
        if (child.id === pageId) {
          return true;
        }
      }
    }
  }
  return false;
};

// Get parent category of a subcategory page
export const getParentCategory = (pageId: string): string | null => {
  for (const item of sidebarConfig) {
    if (item.children) {
      for (const child of item.children) {
        if (child.id === pageId) {
          return item.id;
        }
      }
    }
  }
  return null;
};

// Legacy ROLE_CONFIG for backward compatibility - this seems to be missing from the imports in Sidebar.tsx
export const ROLE_CONFIG = {
  Admin: {
    color: 'bg-red-100 text-red-800 border-red-200',
    permissions: ['create', 'read', 'update', 'delete', 'manage_users']
  },
  Staff: {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    permissions: ['create', 'read', 'update']
  },
  Client: {
    color: 'bg-green-100 text-green-800 border-green-200',
    permissions: ['read']
  }
};