/**
 * Construction Infrastructure RBAC Service
 * Manages role-based access control for construction infrastructure projects
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
  assignedBy: string;
  assignedDate: string;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canViewDocuments: boolean;
    canUploadDocuments: boolean;
  };
}

class ConstructionInfrastructureRBACService {
  private projectAssignments: Map<string, ProjectAssignment[]> = new Map();

  /**
   * Get user permissions based on role and category
   */
  getUserPermissions(
    userEmail: string,
    userRole: string,
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

    // Staff/Editor has limited permissions
    if (userRole === 'Staff' || userRole === 'Editor') {
      const assignedProjects = this.getAssignedProjects(userEmail);
      return {
        canView: true,
        canAdd: false, // Staff cannot add new projects
        canEdit: assignedProjects.length > 0, // Can edit only assigned projects
        canDelete: false, // Staff cannot delete
        canApprove: false,
        canAssignStaff: false,
        canManageDocuments: assignedProjects.length > 0,
        canExportData: true,
        assignedProjects: assignedProjects.map(a => a.projectId)
      };
    }

    // Client/Guest - read-only
    return basePermissions;
  }

  /**
   * Check if user can perform CRUD operations
   */
  canPerformCRUD(userEmail: string, userRole: string, category: string = 'construction-infrastructure'): boolean {
    const permissions = this.getUserPermissions(userEmail, userRole, category);
    return permissions.canAdd || permissions.canEdit || permissions.canDelete;
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
   * Assign staff to a project (Admin only)
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

    return true;
  }

  /**
   * Remove staff assignment from project
   */
  removeStaffFromProject(projectId: string, staffEmail: string): boolean {
    const assignments = this.projectAssignments.get(projectId) || [];
    const filtered = assignments.filter(a => a.staffEmail !== staffEmail);
    this.projectAssignments.set(projectId, filtered);
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
   * Get permission label for UI display
   */
  getPermissionLabel(userRole: string): string {
    switch (userRole) {
      case 'Admin':
        return 'Full Access - Can manage all projects and assignments';
      case 'Staff':
      case 'Editor':
        return 'Limited Access - Can edit assigned projects only';
      case 'Client':
      default:
        return 'View Only - Can view all data but cannot modify';
    }
  }

  /**
   * Initialize with mock data for demonstration
   */
  initializeMockData() {
    // Sample assignments for demonstration
    this.assignStaffToProject(
      'gaa-001',
      'Academic Building Extension',
      'staff1@carsu.edu.ph',
      'Juan Dela Cruz',
      'admin@carsu.edu.ph',
      {
        canEdit: true,
        canDelete: false,
        canViewDocuments: true,
        canUploadDocuments: true
      }
    );

    this.assignStaffToProject(
      'local-001',
      'Engineering Workshop',
      'staff2@carsu.edu.ph',
      'Maria Santos',
      'admin@carsu.edu.ph',
      {
        canEdit: true,
        canDelete: false,
        canViewDocuments: true,
        canUploadDocuments: true
      }
    );
  }
}

// Create singleton instance
export const constructionInfrastructureRBACService = new ConstructionInfrastructureRBACService();

// Initialize with mock data
constructionInfrastructureRBACService.initializeMockData();
