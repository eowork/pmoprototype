/**
 * Enhanced RBAC Service for Construction Infrastructure
 * Implements department-based access control, personnel assignments, and page-level permissions
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

export interface DepartmentAccess {
  department: string;
  allowedCategories: string[]; // e.g., ['construction-of-infrastructure', 'gaa-funded-projects']
  allowedPages: string[]; // Page identifiers
}

export interface UserPagePermission {
  userEmail: string;
  userName: string;
  department: string;
  role: string;
  allowedPages: string[]; // Specific pages this user can access
  assignedBy: string;
  assignedDate: string;
}

// Department to Category mappings
const DEPARTMENT_CATEGORY_MAP: Record<string, string[]> = {
  'Engineering and Construction Office (ECO)': [
    'construction-of-infrastructure',
    'gaa-funded-projects',
    'locally-funded-projects',
    'special-grants-projects'
  ],
  'Planning and Development Office': [
    'construction-of-infrastructure',
    'university-operations',
    'gaa-funded-projects',
    'locally-funded-projects'
  ],
  'Gender and Development Office': [
    'gad-parity-report',
    'gender-parity-report',
    'gpb-accomplishment',
    'gad-budget-and-plans'
  ],
  'Research and Extension Office': [
    'university-operations',
    'research-program',
    'technical-advisory-extension-program'
  ],
  'Facilities Management': [
    'classroom-administrative-offices',
    'classroom-csu-main-cc',
    'admin-office-csu-main-cc',
    'repairs'
  ],
  'General': [] // Can access all if assigned by admin
};

class EnhancedRBACService {
  private projectAssignments: Map<string, ProjectAssignment[]> = new Map();
  private userPagePermissions: Map<string, UserPagePermission> = new Map();

  /**
   * Get allowed pages based on user's department
   */
  getAllowedPagesByDepartment(department: string): string[] {
    return DEPARTMENT_CATEGORY_MAP[department] || [];
  }

  /**
   * Check if user can access a specific page based on department
   */
  canAccessPage(userEmail: string, userRole: string, department: string, pageId: string): boolean {
    // Admin can access everything
    if (userRole === 'Admin') {
      return true;
    }

    // Client can view all pages
    if (userRole === 'Client') {
      return true;
    }

    // Check custom page permissions first
    const userPermission = this.userPagePermissions.get(userEmail);
    if (userPermission && userPermission.allowedPages.length > 0) {
      return userPermission.allowedPages.includes(pageId);
    }

    // Check department-based access
    const allowedPages = this.getAllowedPagesByDepartment(department);
    
    // If department has no specific restrictions (General), allow all pages
    if (department === 'General' || allowedPages.length === 0) {
      return true;
    }

    return allowedPages.includes(pageId);
  }

  /**
   * Get user permissions based on role, category, and project assignment
   */
  getUserPermissions(
    userEmail: string,
    userRole: string,
    department: string = 'General',
    category: string = 'construction-infrastructure'
  ): UserPermissions {
    const basePermissions: UserPermissions = {
      canView: true, // Everyone can view
      canAdd: false,
      canEdit: false,
      canDelete: false,
      canApprove: false,
      canAssignStaff: false,
      canManageDocuments: false,
      canExportData: true,
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
        canAdd: true, // Staff can create projects in their department
        canEdit: assignedProjects.length > 0, // Can edit only assigned projects
        canDelete: false, // Staff cannot delete
        canApprove: false,
        canAssignStaff: true, // Staff can assign other personnel to projects they create
        canManageDocuments: assignedProjects.length > 0,
        canExportData: true,
        assignedProjects: assignedProjects.map(a => a.projectId)
      };
    }

    // Client/Guest - read-only
    return basePermissions;
  }

  /**
   * Check if user can view a specific project
   */
  canViewProject(userEmail: string, userRole: string, projectId: string, department: string): boolean {
    // Admin and Client can view all projects
    if (userRole === 'Admin' || userRole === 'Client') {
      return true;
    }

    // Staff can view if:
    // 1. They are assigned to the project
    // 2. Or their department allows access to this category
    const assignments = this.projectAssignments.get(projectId) || [];
    const isAssigned = assignments.some(a => a.staffEmail === userEmail);
    
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
      role: 'Staff', // Default role, can be enhanced later
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
   * Assign page-level permissions to a user (Admin only)
   */
  assignPagePermissionsToUser(
    userEmail: string,
    userName: string,
    department: string,
    role: string,
    allowedPages: string[],
    assignedBy: string
  ): boolean {
    const permission: UserPagePermission = {
      userEmail,
      userName,
      department,
      role,
      allowedPages,
      assignedBy,
      assignedDate: new Date().toISOString()
    };

    this.userPagePermissions.set(userEmail, permission);
    this.persistPagePermissions();
    return true;
  }

  /**
   * Get page permissions for a user
   */
  getUserPagePermissions(userEmail: string): UserPagePermission | undefined {
    return this.userPagePermissions.get(userEmail);
  }

  /**
   * Remove page permissions from user
   */
  removeUserPagePermissions(userEmail: string): boolean {
    this.userPagePermissions.delete(userEmail);
    this.persistPagePermissions();
    return true;
  }

  /**
   * Get all users with custom page permissions
   */
  getAllUserPagePermissions(): UserPagePermission[] {
    return Array.from(this.userPagePermissions.values());
  }

  /**
   * Persist assignments to localStorage
   */
  private persistAssignments(): void {
    try {
      const data = Array.from(this.projectAssignments.entries());
      localStorage.setItem('csu_pmo_project_assignments', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist assignments:', error);
    }
  }

  /**
   * Persist page permissions to localStorage
   */
  private persistPagePermissions(): void {
    try {
      const data = Array.from(this.userPagePermissions.entries());
      localStorage.setItem('csu_pmo_page_permissions', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist page permissions:', error);
    }
  }

  /**
   * Load assignments from localStorage
   */
  loadAssignments(): void {
    try {
      const stored = localStorage.getItem('csu_pmo_project_assignments');
      if (stored) {
        const data = JSON.parse(stored);
        this.projectAssignments = new Map(data);
      }
    } catch (error) {
      console.error('Failed to load assignments:', error);
    }
  }

  /**
   * Load page permissions from localStorage
   */
  loadPagePermissions(): void {
    try {
      const stored = localStorage.getItem('csu_pmo_page_permissions');
      if (stored) {
        const data = JSON.parse(stored);
        this.userPagePermissions = new Map(data);
      }
    } catch (error) {
      console.error('Failed to load page permissions:', error);
    }
  }

  /**
   * Get permission label for UI display
   */
  getPermissionLabel(userRole: string): string {
    switch (userRole) {
      case 'Admin':
        return 'Full Access - Can manage all projects and assignments';
      case 'Staff':
      case 'Editor':
        return 'Department-Based Access - Can create projects and assign personnel';
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
   * Get department access info
   */
  getDepartmentAccess(department: string): DepartmentAccess {
    return {
      department,
      allowedCategories: DEPARTMENT_CATEGORY_MAP[department] || [],
      allowedPages: DEPARTMENT_CATEGORY_MAP[department] || []
    };
  }

  /**
   * Initialize with mock data for demonstration
   */
  initializeMockData(): void {
    // DEMO: Alexander Brayn Q. Estrobo - Construction Projects
    // Shared projects with Meo Angelo (gaa-001, gaa-002)
    this.assignStaffToProject(
      'gaa-001',
      'Academic Building Extension - Main Campus',
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
      'gaa-002',
      'Library and Learning Commons Renovation',
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

    // Alexander's exclusive project
    this.assignStaffToProject(
      'local-001',
      'Engineering Workshop Construction',
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

    // DEMO: Meo Angelo Alcantara - Construction Projects
    // Shared projects with Alexander (gaa-001, gaa-002)
    this.assignStaffToProject(
      'gaa-001',
      'Academic Building Extension - Main Campus',
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
      'gaa-002',
      'Library and Learning Commons Renovation',
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

    // Meo's exclusive projects
    this.assignStaffToProject(
      'gaa-003',
      'Science Laboratory Complex',
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
      'local-002',
      'Student Activity Center',
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
  }
}

// Create singleton instance
export const enhancedRBACService = new EnhancedRBACService();

// Initialize with stored data and mock data
enhancedRBACService.loadAssignments();
enhancedRBACService.loadPagePermissions();
enhancedRBACService.initializeMockData();