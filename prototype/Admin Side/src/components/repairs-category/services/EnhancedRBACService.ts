/**
 * Enhanced RBAC Service for Repairs & Maintenance Category
 * Implements project-based access control and personnel assignment management
 * Following the same pattern as Construction Infrastructure for consistency
 */

export interface UserPermissions {
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canAssignStaff: boolean;
  canManageDocuments: boolean;
  canExportData: boolean;
  canManageInsights?: boolean;
  assignedProjects?: string[]; // Specific project IDs user is assigned to
}

export interface ProjectAssignment {
  projectId: string;
  projectTitle: string;
  staffEmail: string;
  staffName: string;
  role: string;
  assignedBy: string;
  assignedDate: string;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canViewDocuments: boolean;
    canUploadDocuments: boolean;
  };
}

// Department to Category mappings for Repairs
const DEPARTMENT_CATEGORY_MAP: Record<string, string[]> = {
  'Facilities Management': [
    'repairs',
    'repairs-category',
    'classrooms',
    'administrative-offices',
    'main-campus-repairs',
    'cabadbaran-campus-repairs'
  ],
  'Property Management': [
    'repairs',
    'repairs-category',
    'classrooms',
    'administrative-offices',
    'main-campus-repairs',
    'cabadbaran-campus-repairs'
  ],
  'Maintenance': [
    'repairs',
    'repairs-category',
    'classrooms',
    'administrative-offices',
    'main-campus-repairs',
    'cabadbaran-campus-repairs'
  ],
  'Engineering and Construction Office (ECO)': [
    'repairs',
    'classrooms',
    'administrative-offices',
    'construction-of-infrastructure'
  ],
  'General': [] // Can access all if assigned by admin
};

class EnhancedRepairsRBACService {
  private projectAssignments: Map<string, ProjectAssignment[]> = new Map();

  /**
   * Get allowed pages based on user's department
   */
  getAllowedPagesByDepartment(department: string): string[] {
    return DEPARTMENT_CATEGORY_MAP[department] || [];
  }

  /**
   * Check if user can access a specific page based on department
   * Updated to follow COI pattern: Allow page access, but filter projects
   */
  canAccessPage(userEmail: string, userRole: string, department: string, pageId: string): boolean {
    // Admin can access everything
    if (userRole === 'Admin') {
      return true;
    }

    // Client can view all pages (transparency requirement)
    if (userRole === 'Client') {
      return true;
    }

    // Staff/Editor: Allow access to repairs pages
    // Projects will be filtered based on assignments
    if (userRole === 'Staff' || userRole === 'Editor') {
      const allowedPages = this.getAllowedPagesByDepartment(department);
      
      // If department has no specific restrictions (General), allow access
      if (department === 'General' || allowedPages.length === 0) {
        return true;
      }
      
      // Check if page is in allowed pages OR if user has project assignments
      const hasAssignments = this.getAssignedProjects(userEmail).length > 0;
      return allowedPages.includes(pageId) || hasAssignments;
    }

    return true; // Default: allow access (transparency)
  }

  /**
   * Get user permissions based on role, category, and project assignment
   */
  getUserPermissions(
    userEmail: string,
    userRole: string,
    department: string = 'General',
    category: string = 'repairs'
  ): UserPermissions {
    const basePermissions: UserPermissions = {
      canView: true, // Everyone can view (public transparency)
      canAdd: false,
      canEdit: false,
      canDelete: false,
      canApprove: false,
      canAssignStaff: false,
      canManageDocuments: false,
      canExportData: true,
      canManageInsights: false,
      assignedProjects: []
    };

    // Admin has full permissions
    if (userRole === 'Admin') {
      return {
        canView: true,
        canAdd: true,
        canEdit: true,
        canDelete: true,
        canApprove: true,
        canAssignStaff: true,
        canManageDocuments: true,
        canExportData: true,
        canManageInsights: true,
        assignedProjects: [] // Admin can access all projects
      };
    }

    // Check if user's department allows access to this category
    const canAccessCategory = this.canAccessPage(userEmail, userRole, department, category);
    
    if (!canAccessCategory) {
      return basePermissions; // Read-only if department doesn't match
    }

    // Staff/Editor has permissions based on assignments
    if (userRole === 'Staff' || userRole === 'Editor') {
      const assignedProjects = this.getAssignedProjects(userEmail);
      return {
        canView: true,
        canAdd: true, // Staff can create repair projects in their department
        canEdit: assignedProjects.length > 0, // Can edit only assigned projects
        canDelete: false, // Staff cannot delete (only Admin)
        canApprove: false,
        canAssignStaff: true, // Staff can assign other personnel to projects they create
        canManageDocuments: assignedProjects.length > 0,
        canExportData: true,
        canManageInsights: userRole === 'Editor', // Only Editors can manage insights
        assignedProjects: assignedProjects.map(a => a.projectId)
      };
    }

    // Client/Guest - read-only
    return basePermissions;
  }

  /**
   * Check if user can view a specific project
   * CRITICAL: This enforces project-level access control
   */
  canViewProject(userEmail: string, userRole: string, projectId: string, department: string): boolean {
    // Admin and Client can view all projects
    if (userRole === 'Admin' || userRole === 'Client') {
      return true;
    }

    // Staff can view if they are assigned to the project
    const assignments = this.projectAssignments.get(projectId) || [];
    const isAssigned = assignments.some(a => a.staffEmail === userEmail);
    
    // If not assigned, deny access
    return isAssigned;
  }

  /**
   * Check if user can edit a specific project
   */
  canEditProject(userEmail: string, userRole: string, projectId: string): boolean {
    if (userRole === 'Admin') {
      return true;
    }

    const assignments = this.projectAssignments.get(projectId) || [];
    const userAssignment = assignments.find(a => a.staffEmail === userEmail);
    
    return userAssignment?.permissions.canEdit || false;
  }

  /**
   * Check if user can delete a specific project
   */
  canDeleteProject(userEmail: string, userRole: string, projectId: string): boolean {
    if (userRole === 'Admin') {
      return true;
    }

    const assignments = this.projectAssignments.get(projectId) || [];
    const userAssignment = assignments.find(a => a.staffEmail === userEmail);
    
    return userAssignment?.permissions.canDelete || false;
  }

  /**
   * Assign staff to a project
   */
  assignStaffToProject(
    projectId: string,
    projectTitle: string,
    staffEmail: string,
    staffName: string,
    assignedBy: string,
    permissions: ProjectAssignment['permissions']
  ): boolean {
    const assignment: ProjectAssignment = {
      projectId,
      projectTitle,
      staffEmail,
      staffName,
      role: 'Staff', // Default role
      assignedBy,
      assignedDate: new Date().toISOString(),
      permissions
    };

    const existing = this.projectAssignments.get(projectId) || [];
    
    // Check if already assigned
    const alreadyAssigned = existing.find(a => a.staffEmail === staffEmail);
    if (alreadyAssigned) {
      // Update permissions
      const updated = existing.map(a => 
        a.staffEmail === staffEmail ? assignment : a
      );
      this.projectAssignments.set(projectId, updated);
    } else {
      this.projectAssignments.set(projectId, [...existing, assignment]);
    }

    // Store in localStorage for persistence
    this.persistAssignments();

    return true;
  }

  /**
   * Remove staff assignment from project
   */
  removeStaffFromProject(projectId: string, staffEmail: string): boolean {
    const assignments = this.projectAssignments.get(projectId) || [];
    const filtered = assignments.filter(a => a.staffEmail !== staffEmail);
    this.projectAssignments.set(projectId, filtered);
    this.persistAssignments();
    return true;
  }

  /**
   * Get all staff assigned to a project
   */
  getProjectStaff(projectId: string): ProjectAssignment[] {
    return this.projectAssignments.get(projectId) || [];
  }

  /**
   * Get all projects assigned to a staff member
   */
  getAssignedProjects(staffEmail: string): ProjectAssignment[] {
    const allAssignments: ProjectAssignment[] = [];
    
    this.projectAssignments.forEach((assignments) => {
      const userAssignments = assignments.filter(a => a.staffEmail === staffEmail);
      allAssignments.push(...userAssignments);
    });

    return allAssignments;
  }

  /**
   * Persist assignments to localStorage
   */
  private persistAssignments(): void {
    try {
      const data = Array.from(this.projectAssignments.entries());
      localStorage.setItem('csu_pmo_repairs_project_assignments', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist repair assignments:', error);
    }
  }

  /**
   * Load assignments from localStorage
   */
  loadAssignments(): void {
    try {
      const stored = localStorage.getItem('csu_pmo_repairs_project_assignments');
      if (stored) {
        const data = JSON.parse(stored);
        this.projectAssignments = new Map(data);
      }
    } catch (error) {
      console.error('Failed to load repair assignments:', error);
    }
  }

  /**
   * Get permission label for UI display
   */
  getPermissionLabel(userRole: string): string {
    switch (userRole) {
      case 'Admin':
        return 'Full Access - Can manage all repair projects and assignments';
      case 'Staff':
      case 'Editor':
        return 'Department-Based Access - Can create repair projects and assign personnel';
      case 'Client':
      default:
        return 'View Only - Can view all data but cannot modify';
    }
  }

  /**
   * Get available departments
   */
  getAvailableDepartments(): string[] {
    return Object.keys(DEPARTMENT_CATEGORY_MAP);
  }

  /**
   * Initialize with mock data for demonstration
   * IMPORTANT: This creates sample project assignments to demonstrate RBAC
   */
  initializeMockData(): void {
    // rafael.santos@carsu.edu.ph - Has access to 3 projects:
    // 2 classroom projects and 1 administrative office project
    
    // Classroom Project 1
    this.assignStaffToProject(
      'class-main-001',
      'Engineering Building Room 301 AC Repair',
      'rafael.santos@carsu.edu.ph',
      'Rafael Santos',
      'admin@carsu.edu.ph',
      {
        canEdit: true,
        canDelete: false,
        canViewDocuments: true,
        canUploadDocuments: true
      }
    );

    // Classroom Project 2
    this.assignStaffToProject(
      'class-main-002',
      'Science Laboratory Ceiling Repair',
      'rafael.santos@carsu.edu.ph',
      'Rafael Santos',
      'admin@carsu.edu.ph',
      {
        canEdit: true,
        canDelete: false,
        canViewDocuments: true,
        canUploadDocuments: true
      }
    );

    // Administrative Office Project 1
    this.assignStaffToProject(
      'admin-main-001',
      'Registrar Office Air Conditioning System Overhaul',
      'rafael.santos@carsu.edu.ph',
      'Rafael Santos',
      'admin@carsu.edu.ph',
      {
        canEdit: true,
        canDelete: false,
        canViewDocuments: true,
        canUploadDocuments: true
      }
    );

    // john.doe@carsu.edu.ph - Different set of projects (1 classroom, 1 admin)
    this.assignStaffToProject(
      'class-main-003',
      'Mathematics Department Whiteboard Installation',
      'john.doe@carsu.edu.ph',
      'John Doe',
      'admin@carsu.edu.ph',
      {
        canEdit: true,
        canDelete: false,
        canViewDocuments: true,
        canUploadDocuments: true
      }
    );

    this.assignStaffToProject(
      'admin-main-002',
      'President Office Ceiling Water Damage Repair',
      'john.doe@carsu.edu.ph',
      'John Doe',
      'admin@carsu.edu.ph',
      {
        canEdit: true,
        canDelete: false,
        canViewDocuments: true,
        canUploadDocuments: true
      }
    );

    // jane.smith@carsu.edu.ph - Has access to classroom projects
    this.assignStaffToProject(
      'class-cc-001',
      'Computer Laboratory Aircon Repair',
      'jane.smith@carsu.edu.ph',
      'Jane Smith',
      'admin@carsu.edu.ph',
      {
        canEdit: true,
        canDelete: false,
        canViewDocuments: true,
        canUploadDocuments: true
      }
    );

    this.assignStaffToProject(
      'class-cc-002',
      'Classroom Building Roof Leak Fix',
      'jane.smith@carsu.edu.ph',
      'Jane Smith',
      'admin@carsu.edu.ph',
      {
        canEdit: true,
        canDelete: false,
        canViewDocuments: true,
        canUploadDocuments: true
      }
    );

    // ============================================
    // DEMO: Cross-Category Access for Alexander and Meo
    // ============================================
    
    // Alexander Brayn Q. Estrobo - Repair Projects
    // Shared projects with Meo Angelo (main-001, main-002)
    this.assignStaffToProject(
      'main-001',
      'Main Campus - Engineering Building Electrical Repair',
      'alexander.estrobo@carsu.edu.ph',
      'Mr. Alexander Brayn Q. Estrobo',
      'marjorie.escartin@carsu.edu.ph',
      {
        canEdit: true,
        canDelete: false,
        canViewDocuments: true,
        canUploadDocuments: true
      }
    );

    this.assignStaffToProject(
      'main-002',
      'Main Campus - Administration Building HVAC Upgrade',
      'alexander.estrobo@carsu.edu.ph',
      'Mr. Alexander Brayn Q. Estrobo',
      'marjorie.escartin@carsu.edu.ph',
      {
        canEdit: true,
        canDelete: false,
        canViewDocuments: true,
        canUploadDocuments: true
      }
    );

    // Alexander's exclusive repair project
    this.assignStaffToProject(
      'bxu-001',
      'BXU Campus - Library Roof Waterproofing',
      'alexander.estrobo@carsu.edu.ph',
      'Mr. Alexander Brayn Q. Estrobo',
      'marjorie.escartin@carsu.edu.ph',
      {
        canEdit: true,
        canDelete: false,
        canViewDocuments: true,
        canUploadDocuments: true
      }
    );

    // Meo Angelo Alcantara - Repair Projects
    // Shared projects with Alexander (main-001, main-002)
    this.assignStaffToProject(
      'main-001',
      'Main Campus - Engineering Building Electrical Repair',
      'meo.alcantara@carsu.edu.ph',
      'Meo Angelo Alcantara',
      'marjorie.escartin@carsu.edu.ph',
      {
        canEdit: true,
        canDelete: true, // Admin has delete permissions
        canViewDocuments: true,
        canUploadDocuments: true
      }
    );

    this.assignStaffToProject(
      'main-002',
      'Main Campus - Administration Building HVAC Upgrade',
      'meo.alcantara@carsu.edu.ph',
      'Meo Angelo Alcantara',
      'marjorie.escartin@carsu.edu.ph',
      {
        canEdit: true,
        canDelete: true,
        canViewDocuments: true,
        canUploadDocuments: true
      }
    );

    // Meo's exclusive repair projects
    this.assignStaffToProject(
      'main-003',
      'Main Campus - Science Laboratory Plumbing Overhaul',
      'meo.alcantara@carsu.edu.ph',
      'Meo Angelo Alcantara',
      'marjorie.escartin@carsu.edu.ph',
      {
        canEdit: true,
        canDelete: true,
        canViewDocuments: true,
        canUploadDocuments: true
      }
    );

    this.assignStaffToProject(
      'bxu-002',
      'BXU Campus - Gymnasium Floor Restoration',
      'meo.alcantara@carsu.edu.ph',
      'Meo Angelo Alcantara',
      'marjorie.escartin@carsu.edu.ph',
      {
        canEdit: true,
        canDelete: true,
        canViewDocuments: true,
        canUploadDocuments: true
      }
    );

    // Note: pedro.reyes@carsu.edu.ph has NO project assignments
    // They can access the repairs pages but will see filtered/empty list
  }
}

// Create singleton instance
export const enhancedRepairsRBACService = new EnhancedRepairsRBACService();

// Initialize with stored data and mock data
enhancedRepairsRBACService.loadAssignments();
enhancedRepairsRBACService.initializeMockData();
