/**
 * Repairs Category RBAC Service
 * Manages personnel assignments and access control for repair projects
 */

export interface ProjectPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canViewDocuments: boolean;
  canUploadDocuments: boolean;
}

export interface ProjectAssignment {
  projectId: string;
  projectTitle: string;
  staffEmail: string;
  staffName: string;
  assignedBy: string;
  assignedDate: string;
  permissions: ProjectPermissions;
}

class RepairsCategoryRBACService {
  private assignments: Map<string, ProjectAssignment[]> = new Map();

  constructor() {
    // Initialize with some sample assignments for demonstration
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample assignments can be added here if needed for demo
  }

  /**
   * Assign a staff member to a project
   */
  assignStaffToProject(
    projectId: string,
    projectTitle: string,
    staffEmail: string,
    staffName: string,
    assignedBy: string,
    permissions: ProjectPermissions
  ): boolean {
    try {
      const projectAssignments = this.assignments.get(projectId) || [];

      // Check if already assigned
      const existingIndex = projectAssignments.findIndex(
        (a) => a.staffEmail === staffEmail
      );

      const assignment: ProjectAssignment = {
        projectId,
        projectTitle,
        staffEmail,
        staffName,
        assignedBy,
        assignedDate: new Date().toISOString(),
        permissions,
      };

      if (existingIndex >= 0) {
        // Update existing assignment
        projectAssignments[existingIndex] = assignment;
      } else {
        // Add new assignment
        projectAssignments.push(assignment);
      }

      this.assignments.set(projectId, projectAssignments);
      return true;
    } catch (error) {
      console.error('Error assigning staff to project:', error);
      return false;
    }
  }

  /**
   * Remove a staff member from a project
   */
  removeStaffFromProject(projectId: string, staffEmail: string): boolean {
    try {
      const projectAssignments = this.assignments.get(projectId) || [];
      const filtered = projectAssignments.filter(
        (a) => a.staffEmail !== staffEmail
      );

      if (filtered.length === projectAssignments.length) {
        return false; // Staff not found
      }

      this.assignments.set(projectId, filtered);
      return true;
    } catch (error) {
      console.error('Error removing staff from project:', error);
      return false;
    }
  }

  /**
   * Get all staff assigned to a project
   */
  getProjectStaff(projectId: string): ProjectAssignment[] {
    return this.assignments.get(projectId) || [];
  }

  /**
   * Get all projects assigned to a staff member
   */
  getStaffProjects(staffEmail: string): ProjectAssignment[] {
    const staffProjects: ProjectAssignment[] = [];

    this.assignments.forEach((projectAssignments) => {
      const assignment = projectAssignments.find(
        (a) => a.staffEmail === staffEmail
      );
      if (assignment) {
        staffProjects.push(assignment);
      }
    });

    return staffProjects;
  }

  /**
   * Check if a staff member has access to a project
   */
  hasProjectAccess(projectId: string, staffEmail: string): boolean {
    const projectAssignments = this.assignments.get(projectId) || [];
    return projectAssignments.some((a) => a.staffEmail === staffEmail);
  }

  /**
   * Get permissions for a staff member on a project
   */
  getStaffPermissions(
    projectId: string,
    staffEmail: string
  ): ProjectPermissions | null {
    const projectAssignments = this.assignments.get(projectId) || [];
    const assignment = projectAssignments.find(
      (a) => a.staffEmail === staffEmail
    );
    return assignment?.permissions || null;
  }

  /**
   * Update permissions for a staff member on a project
   */
  updateStaffPermissions(
    projectId: string,
    staffEmail: string,
    permissions: ProjectPermissions
  ): boolean {
    try {
      const projectAssignments = this.assignments.get(projectId) || [];
      const assignment = projectAssignments.find(
        (a) => a.staffEmail === staffEmail
      );

      if (!assignment) {
        return false;
      }

      assignment.permissions = permissions;
      this.assignments.set(projectId, projectAssignments);
      return true;
    } catch (error) {
      console.error('Error updating staff permissions:', error);
      return false;
    }
  }

  /**
   * Get summary of all assignments
   */
  getAssignmentSummary(): {
    totalProjects: number;
    totalStaff: number;
    totalAssignments: number;
  } {
    const uniqueStaff = new Set<string>();
    let totalAssignments = 0;

    this.assignments.forEach((projectAssignments) => {
      totalAssignments += projectAssignments.length;
      projectAssignments.forEach((a) => uniqueStaff.add(a.staffEmail));
    });

    return {
      totalProjects: this.assignments.size,
      totalStaff: uniqueStaff.size,
      totalAssignments,
    };
  }

  /**
   * Clear all assignments (for testing purposes)
   */
  clearAllAssignments(): void {
    this.assignments.clear();
  }
}

// Singleton instance
export const repairsCategoryRBACService = new RepairsCategoryRBACService();
