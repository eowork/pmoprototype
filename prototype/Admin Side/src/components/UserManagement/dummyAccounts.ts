/**
 * Comprehensive Dummy Accounts for CSU PMO Dashboard
 * Role-Based Access Control (RBAC) System
 * 
 * Each account is configured with specific page access based on their role and department
 */

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // For demo purposes only
  role: 'Admin' | 'Director' | 'Staff' | 'Editor' | 'Client';
  position: string;
  department: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  createdAt: string;
  phone?: string;
  avatar?: string;
  allowedPages: string[]; // Specific pages this user can access
  assignedProjects?: {
    construction?: string[];
    repairs?: string[];
    fabrication?: string[];
  }; // Project assignments for RBAC demonstration
  description?: string; // Description of role/scope
}

/**
 * Comprehensive list of all dummy accounts
 * Organized by role and department
 */
export const DUMMY_ACCOUNTS: User[] = [
  // ============================================
  // ADMIN ACCOUNTS - Full Access
  // ============================================
  {
    id: 'admin-001',
    name: 'Ms. Marjorie L. Escartin',
    email: 'marjorie.escartin@carsu.edu.ph',
    password: 'admin123',
    role: 'Admin',
    position: 'PMO Director',
    department: 'Project Management Office',
    status: 'active',
    lastLogin: '2024-10-24T10:30:00Z',
    createdAt: '2024-01-15T00:00:00Z',
    phone: '+63 85 341-3162',
    allowedPages: ['*'], // All pages
    description: 'Full system access - Can view, create, edit, delete all data across all modules'
  },
  {
    id: 'admin-002',
    name: 'Dr. Maria Santos',
    email: 'maria.santos@carsu.edu.ph',
    password: 'admin123',
    role: 'Admin',
    position: 'Assistant PMO Director',
    department: 'Project Management Office',
    status: 'active',
    lastLogin: '2024-10-24T09:45:00Z',
    createdAt: '2024-01-15T00:00:00Z',
    phone: '+63 85 341-3167',
    allowedPages: ['*'], // All pages
    description: 'Full system access - Can view, create, edit, delete all data across all modules'
  },

  // ============================================
  // CONSTRUCTION INFRASTRUCTURE STAFF
  // ============================================
  {
    id: 'staff-const-001',
    name: 'Mr. Alexander Brayn Q. Estrobo',
    email: 'alexander.estrobo@carsu.edu.ph',
    password: 'staff123',
    role: 'Staff',
    position: 'PMO I - Construction & Repairs Officer',
    department: 'Engineering and Construction Office (ECO)',
    status: 'active',
    lastLogin: '2024-10-24T08:15:00Z',
    createdAt: '2024-02-01T00:00:00Z',
    phone: '+63 85 341-3163',
    allowedPages: [
      'overview',
      'home',
      'about-us',
      'construction-of-infrastructure',
      'construction-overview',
      'gaa-funded-projects',
      'locally-funded-projects',
      'special-grants-projects',
      'repairs',
      'repairs-overview',
      'classrooms-csu-cc-bxu',
      'administrative-offices-csu-cc-bxu',
      'settings'
    ],
    assignedProjects: {
      construction: ['gaa-001', 'gaa-002', 'local-001'],
      repairs: ['main-001', 'main-002', 'bxu-001']
    },
    description: 'Construction & Repairs scope - Can view and manage assigned construction projects (GAA, Locally-Funded, Special Grants) and repair projects. Has access to 3 construction projects and 3 repair projects with 2 shared projects with Meo Angelo.'
  },
  {
    id: 'staff-const-002',
    name: 'Meo Angelo Alcantara',
    email: 'meo.alcantara@carsu.edu.ph',
    password: 'staff123',
    role: 'Admin',
    position: 'PMO I - Infrastructure Engineer & System Administrator',
    department: 'Engineering and Construction Office (ECO)',
    status: 'active',
    lastLogin: '2024-10-23T16:45:00Z',
    createdAt: '2024-02-15T00:00:00Z',
    phone: '+63 85 341-3164',
    allowedPages: ['*'], // All pages - Full admin access
    assignedProjects: {
      construction: ['gaa-001', 'gaa-002', 'gaa-003', 'local-002'],
      repairs: ['main-001', 'main-002', 'main-003', 'bxu-002']
    },
    description: 'Full system access - Administrator with complete access to all users and system modules. Demonstrates cross-category project assignments with 4 construction projects and 4 repair projects, sharing 2 projects each with Alexander Estrobo.'
  },

  // ============================================
  // UNIVERSITY OPERATIONS STAFF
  // ============================================
  {
    id: 'staff-ops-001',
    name: 'Dr. Robert Mendoza',
    email: 'robert.mendoza@carsu.edu.ph',
    password: 'staff123',
    role: 'Staff',
    position: 'Operations Coordinator',
    department: 'Planning and Development Office',
    status: 'active',
    lastLogin: '2024-10-24T07:30:00Z',
    createdAt: '2024-03-01T00:00:00Z',
    phone: '+63 85 341-3170',
    allowedPages: [
      'overview',
      'home',
      'about-us',
      'university-operations',
      'university-operations-overview',
      'higher-education-program',
      'advanced-education-program',
      'research-program',
      'technical-advisory-extension-program',
      'settings'
    ],
    description: 'University Operations scope - Can view and manage all operational programs (Higher Ed, Advanced Ed, Research, Extension)'
  },
  {
    id: 'staff-ops-002',
    name: 'Prof. Linda Garcia',
    email: 'linda.garcia@carsu.edu.ph',
    password: 'staff123',
    role: 'Staff',
    position: 'Academic Programs Officer',
    department: 'Planning and Development Office',
    status: 'active',
    lastLogin: '2024-10-23T14:20:00Z',
    createdAt: '2024-03-10T00:00:00Z',
    phone: '+63 85 341-3171',
    allowedPages: [
      'overview',
      'home',
      'about-us',
      'university-operations',
      'university-operations-overview',
      'higher-education-program',
      'advanced-education-program',
      'settings'
    ],
    description: 'University Operations scope - Focused on academic programs (Higher and Advanced Education)'
  },

  // ============================================
  // RESEARCH PROGRAM STAFF
  // ============================================
  {
    id: 'staff-research-001',
    name: 'Dr. Carlos Reyes',
    email: 'carlos.reyes@carsu.edu.ph',
    password: 'staff123',
    role: 'Staff',
    position: 'Research Director',
    department: 'Research and Extension Office',
    status: 'active',
    lastLogin: '2024-10-24T08:00:00Z',
    createdAt: '2024-03-15T00:00:00Z',
    phone: '+63 85 341-3172',
    allowedPages: [
      'overview',
      'home',
      'about-us',
      'university-operations',
      'research-program',
      'technical-advisory-extension-program',
      'settings'
    ],
    description: 'Research and Extension scope - Can view and manage research programs and extension activities'
  },

  // ============================================
  // GAD PARITY AND KNOWLEDGE MANAGEMENT STAFF
  // ============================================
  {
    id: 'staff-gad-001',
    name: 'Lutess Perez',
    email: 'lutess.perez@carsu.edu.ph',
    password: 'staff123',
    role: 'Staff',
    position: 'GAD Focal Person',
    department: 'Gender and Development Office',
    status: 'active',
    lastLogin: '2024-10-24T08:00:00Z',
    createdAt: '2024-03-01T00:00:00Z',
    phone: '+63 85 341-3165',
    allowedPages: [
      'overview',
      'home',
      'about-us',
      'gad-parity-knowledge-management',
      'gad-overview',
      'gender-parity-report',
      'gpb-accomplishment',
      'gad-budget-and-plans',
      'settings'
    ],
    description: 'GAD Parity scope - Can view and manage all GAD reports, budgets, and knowledge management'
  },
  {
    id: 'staff-gad-002',
    name: 'Nico Luminarias',
    email: 'nico.luminarias@carsu.edu.ph',
    password: 'staff123',
    role: 'Staff',
    position: 'GAD Officer',
    department: 'Gender and Development Office',
    status: 'active',
    lastLogin: '2024-10-23T14:20:00Z',
    createdAt: '2024-04-01T00:00:00Z',
    phone: '+63 917 123-4567',
    allowedPages: [
      'overview',
      'home',
      'about-us',
      'gad-parity-knowledge-management',
      'gad-overview',
      'gender-parity-report',
      'gpb-accomplishment',
      'gad-budget-and-plans',
      'settings'
    ],
    description: 'GAD Parity scope - Can view and manage all GAD reports and budgets'
  },
  {
    id: 'staff-gad-003',
    name: 'Mirasol B. Caparinz',
    email: 'mirasol.caparinz@carsu.edu.ph',
    password: 'staff123',
    role: 'Staff',
    position: 'GAD Data Analyst',
    department: 'Gender and Development Office',
    status: 'active',
    lastLogin: '2024-10-22T10:00:00Z',
    createdAt: '2024-05-01T00:00:00Z',
    phone: '+63 85 341-3166',
    allowedPages: [
      'overview',
      'home',
      'about-us',
      'gad-parity-knowledge-management',
      'gad-overview',
      'gender-parity-report',
      'gpb-accomplishment',
      'settings'
    ],
    description: 'GAD Parity scope - Can view and manage gender parity reports and accomplishments'
  },

  // ============================================
  // CLASSROOM & ADMINISTRATIVE OFFICES STAFF
  // ============================================
  {
    id: 'staff-classroom-001',
    name: 'Engr. Patricia Torres',
    email: 'patricia.torres@carsu.edu.ph',
    password: 'staff123',
    role: 'Staff',
    position: 'Classroom Assessment Administrator',
    department: 'Facilities Management',
    status: 'active',
    lastLogin: '2024-10-24T07:45:00Z',
    createdAt: '2024-04-15T00:00:00Z',
    phone: '+63 85 341-3175',
    allowedPages: [
      'overview',
      'home',
      'about-us',
      'classroom-administrative-offices',
      'classroom-admin-overview',
      'classroom-csu-main-cc',
      'settings'
    ],
    description: 'Classroom Assessment Page Admin - ONLY user who can approve and publish classroom assessment records. All classroom assessment submissions (from any user) must be approved by this admin. Has full CRUD and publish access to classroom assessments only.'
  },
  {
    id: 'staff-classroom-002',
    name: 'Mr. Daniel Cruz',
    email: 'daniel.cruz@carsu.edu.ph',
    password: 'staff123',
    role: 'Staff',
    position: 'Administrative Office Assessment Administrator',
    department: 'Facilities Management',
    status: 'active',
    lastLogin: '2024-10-23T13:30:00Z',
    createdAt: '2024-05-01T00:00:00Z',
    phone: '+63 85 341-3176',
    allowedPages: [
      'overview',
      'home',
      'about-us',
      'classroom-administrative-offices',
      'classroom-admin-overview',
      'admin-office-csu-main-cc',
      'settings'
    ],
    description: 'Admin Office Assessment Page Admin - ONLY user who can approve and publish admin office assessment records. All admin office assessment submissions (from any user) must be approved by this admin. Has full CRUD and publish access to admin office assessments only.'
  },
  {
    id: 'staff-classroom-003',
    name: 'Engr. Ramon Gonzales',
    email: 'ramon.gonzales@carsu.edu.ph',
    password: 'staff123',
    role: 'Staff',
    position: 'Prioritization Matrix Administrator',
    department: 'Facilities Management',
    status: 'active',
    lastLogin: '2024-10-24T09:15:00Z',
    createdAt: '2024-05-15T00:00:00Z',
    phone: '+63 85 341-3177',
    allowedPages: [
      'overview',
      'home',
      'about-us',
      'classroom-administrative-offices',
      'classroom-admin-overview',
      'prioritization-matrix',
      'settings'
    ],
    description: 'Prioritization Matrix Page Admin - ONLY user who can approve and publish prioritization matrix assessments. All prioritization matrix submissions (from any user) must be approved by this admin. Has full CRUD and publish access to prioritization matrix only.'
  },

  // ============================================
  // REPAIRS CATEGORY STAFF
  // ============================================
  {
    id: 'staff-repair-001',
    name: 'Roberto Santos',
    email: 'roberto.santos@carsu.edu.ph',
    role: 'Staff',
    position: 'Repairs Coordinator',
    department: 'Repairs Management',
    status: 'active',
    lastActive: '2024-01-20',
    permissions: {
      read: true,
      create: true,
      update: true,
      delete: false
    },
    specificPages: [
      'repairs',
      'repairs-overview',
      'major-repairs',
      'minor-repairs',
      'classrooms-csu-cc-bxu',
      'administrative-offices-csu-cc-bxu'
    ],
    description: 'Repairs scope - Can view and manage all repair projects'
  },
  
  // POLICIES & FORMS STAFF
  {
    id: 'director-policies-001',
    name: 'Dr. Director Name',
    email: 'director@carsu.edu.ph',
    password: 'director123',
    role: 'Director',
    position: 'Policies Director',
    department: 'Office of the Director',
    status: 'active',
    lastLogin: '2024-10-24T09:00:00Z',
    createdAt: '2024-06-01T00:00:00Z',
    phone: '+63 85 341-3180',
    allowedPages: [
      'overview',
      'home',
      'about-us',
      'policies',
      'policies-overview',
      'memorandum-of-agreements',
      'memorandum-of-understanding',
      'settings'
    ],
    description: 'Director - Full CRUD on policies, restricted page access (can be granted by Admin)'
  },
  {
    id: 'staff-policies-001',
    name: 'Atty. Sofia Villanueva',
    email: 'sofia.villanueva@carsu.edu.ph',
    password: 'staff123',
    role: 'Staff',
    position: 'Legal Affairs Officer (View & Add Only)',
    department: 'Legal and Compliance Office',
    status: 'active',
    lastLogin: '2024-10-24T09:00:00Z',
    createdAt: '2024-06-01T00:00:00Z',
    phone: '+63 85 341-3181',
    allowedPages: [
      'overview',
      'home',
      'about-us',
      'policies',
      'policies-overview',
      'memorandum-of-agreements',
      'memorandum-of-understanding',
      'settings'
    ],
    description: 'Staff - Can VIEW and ADD policies only (no edit/delete)'
  },
  {
    id: 'staff-policies-002',
    name: 'Ms. Angela Martinez',
    email: 'angela.martinez@carsu.edu.ph',
    password: 'staff123',
    role: 'Editor',
    position: 'Compliance Officer (View & Add Only)',
    department: 'Legal and Compliance Office',
    status: 'active',
    lastLogin: '2024-10-23T11:30:00Z',
    createdAt: '2024-06-10T00:00:00Z',
    phone: '+63 85 341-3182',
    allowedPages: [
      'overview',
      'home',
      'about-us',
      'policies',
      'policies-overview',
      'memorandum-of-agreements',
      'memorandum-of-understanding',
      'settings'
    ],
    description: 'Editor - Can VIEW and ADD policies only (no edit/delete)'
  },
  {
    id: 'staff-policies-003',
    name: 'Mr. Assigned Personnel',
    email: 'personnel@carsu.edu.ph',
    password: 'personnel123',
    role: 'Staff',
    position: 'Assigned Personnel (View Assigned Only)',
    department: 'Legal and Compliance Office',
    status: 'active',
    lastLogin: '2024-10-23T11:30:00Z',
    createdAt: '2024-06-10T00:00:00Z',
    phone: '+63 85 341-3183',
    allowedPages: [
      'overview',
      'home',
      'about-us',
      'policies',
      'policies-overview',
      'memorandum-of-agreements',
      'memorandum-of-understanding',
      'settings'
    ],
    description: 'Assigned Personnel - Can view ONLY assigned MOA/MOU documents (must be assigned by Admin/Director)'
  },

  // ============================================
  // FORMS & DOCUMENTS STAFF
  // ============================================
  {
    id: 'staff-forms-001',
    name: 'Ms. Grace Dela Rosa',
    email: 'grace.delarosa@carsu.edu.ph',
    password: 'staff123',
    role: 'Staff',
    position: 'Records Management Officer',
    department: 'Records and Documentation Office',
    status: 'active',
    lastLogin: '2024-10-24T08:45:00Z',
    createdAt: '2024-06-15T00:00:00Z',
    phone: '+63 85 341-3182',
    allowedPages: [
      'overview',
      'home',
      'about-us',
      'forms',
      'forms-overview',
      'forms-inventory',
      'settings'
    ],
    description: 'Forms scope - Can view and manage downloadable forms and inventory'
  },
  {
    id: 'staff-forms-002',
    name: 'Mr. Benjamin Aquino',
    email: 'benjamin.aquino@carsu.edu.ph',
    password: 'staff123',
    role: 'Staff',
    position: 'Documentation Specialist',
    department: 'Records and Documentation Office',
    status: 'active',
    lastLogin: '2024-10-23T12:00:00Z',
    createdAt: '2024-06-20T00:00:00Z',
    phone: '+63 85 341-3183',
    allowedPages: [
      'overview',
      'home',
      'about-us',
      'forms',
      'forms-overview',
      'forms-inventory',
      'settings'
    ],
    description: 'Forms scope - Can view and manage forms repository'
  },

  // ============================================
  // MULTI-ACCESS STAFF (Multiple Scopes)
  // ============================================
  {
    id: 'staff-multi-001',
    name: 'Dr. Eduardo Silva',
    email: 'eduardo.silva@carsu.edu.ph',
    password: 'staff123',
    role: 'Staff',
    position: 'Senior Project Officer',
    department: 'Project Management Office',
    status: 'active',
    lastLogin: '2024-10-24T09:30:00Z',
    createdAt: '2024-07-01T00:00:00Z',
    phone: '+63 85 341-3185',
    allowedPages: [
      'overview',
      'home',
      'about-us',
      'construction-of-infrastructure',
      'gaa-funded-projects',
      'locally-funded-projects',
      'university-operations',
      'higher-education-program',
      'repairs',
      'settings'
    ],
    description: 'Multi-scope access - Can view and manage construction, operations, and repairs'
  },

  // ============================================
  // CLIENT ACCOUNTS (View-Only)
  // ============================================
  {
    id: 'client-001',
    name: 'Ms. Lisa Tan',
    email: 'lisa.tan@external.org',
    password: 'client123',
    role: 'Client',
    position: 'Community Representative',
    department: 'External Stakeholder',
    status: 'active',
    createdAt: '2024-10-10T00:00:00Z',
    phone: '+63 918 234-5678',
    allowedPages: ['*'], // Can view all pages (read-only)
    description: 'External stakeholder - Can view all data but cannot create, edit, or delete'
  },
  {
    id: 'client-002',
    name: 'Mr. Juan Dela Cruz',
    email: 'juan.delacruz@gmail.com',
    password: 'client123',
    role: 'Client',
    position: 'Public Viewer',
    department: 'General Public',
    status: 'active',
    createdAt: '2024-10-15T00:00:00Z',
    allowedPages: ['*'], // Can view all pages (read-only)
    description: 'Public viewer - Can view all data for transparency purposes'
  },

  // ============================================
  // PENDING/INACTIVE ACCOUNTS
  // ============================================
  {
    id: 'staff-pending-001',
    name: 'Ms. Anna Reyes',
    email: 'anna.reyes@carsu.edu.ph',
    password: 'staff123',
    role: 'Staff',
    position: 'New Staff Member',
    department: 'Project Management Office',
    status: 'pending',
    createdAt: '2024-10-20T00:00:00Z',
    phone: '+63 85 341-3190',
    allowedPages: ['overview', 'home', 'about-us'],
    description: 'Pending activation - Access will be granted after admin approval'
  }
];

/**
 * Get user by email
 */
export const getUserByEmail = (email: string): User | undefined => {
  return DUMMY_ACCOUNTS.find(user => user.email === email);
};

/**
 * Get users by role
 */
export const getUsersByRole = (role: 'Admin' | 'Director' | 'Staff' | 'Editor' | 'Client'): User[] => {
  return DUMMY_ACCOUNTS.filter(user => user.role === role);
};

/**
 * Get users by department
 */
export const getUsersByDepartment = (department: string): User[] => {
  return DUMMY_ACCOUNTS.filter(user => user.department === department);
};

/**
 * Get active users
 */
export const getActiveUsers = (): User[] => {
  return DUMMY_ACCOUNTS.filter(user => user.status === 'active');
};

/**
 * Validate user credentials (for demo login)
 */
export const validateCredentials = (email: string, password: string): User | null => {
  const user = DUMMY_ACCOUNTS.find(
    u => u.email === email && u.password === password && u.status === 'active'
  );
  return user || null;
};

/**
 * Get all available departments
 */
export const getAllDepartments = (): string[] => {
  const departments = new Set(DUMMY_ACCOUNTS.map(user => user.department));
  return Array.from(departments).sort();
};