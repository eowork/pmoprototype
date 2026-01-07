/**
 * RBAC Service for GAD Parity and Knowledge Management System
 * Handles personnel permissions and access control
 */

import { AssignedPersonnel } from '../admin/PermissionsManager';

export interface PermissionCheck {
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
}

export class RBACService {
  private static instance: RBACService;
  private personnelAssignments: Map<string, AssignedPersonnel[]> = new Map();

  private constructor() {
    // Initialize with default assignments for demonstration
    this.initializeDefaults();
  }

  public static getInstance(): RBACService {
    if (!RBACService.instance) {
      RBACService.instance = new RBACService();
    }
    return RBACService.instance;
  }

  private initializeDefaults() {
    // Default personnel for each category
    const categories = ['students', 'faculty', 'staff', 'pwd', 'indigenous'];
    
    categories.forEach(category => {
      this.personnelAssignments.set(category, [
        {
          id: `${category}-p1`,
          email: 'staff@carsu.edu.ph',
          name: 'Maria Santos',
          role: 'Staff',
          category,
          permissions: { canAdd: true, canEdit: true, canDelete: false },
          assignedBy: 'admin@carsu.edu.ph',
          assignedAt: new Date('2024-01-15')
        },
        {
          id: `${category}-p2`,
          email: 'editor@carsu.edu.ph',
          name: 'Juan Dela Cruz',
          role: 'Editor',
          category,
          permissions: { canAdd: true, canEdit: true, canDelete: false },
          assignedBy: 'admin@carsu.edu.ph',
          assignedAt: new Date('2024-01-16')
        }
      ]);
    });
  }

  /**
   * Check if user has permission for a specific action in a category
   */
  public checkPermission(
    userEmail: string,
    userRole: string,
    category: string,
    action: 'add' | 'edit' | 'delete' | 'approve'
  ): boolean {
    // Admin has all permissions
    if (userRole === 'Admin') {
      return true;
    }

    // Check if user is assigned to this category
    const assignments = this.personnelAssignments.get(category) || [];
    const userAssignment = assignments.find(p => p.email === userEmail);

    if (!userAssignment) {
      return false;
    }

    // Check specific permission
    switch (action) {
      case 'add':
        return userAssignment.permissions.canAdd;
      case 'edit':
        return userAssignment.permissions.canEdit;
      case 'delete':
        return userAssignment.permissions.canDelete;
      case 'approve':
        return userRole === 'Admin'; // Only admins can approve
      default:
        return false;
    }
  }

  /**
   * Get all permissions for a user in a category
   */
  public getUserPermissions(
    userEmail: string,
    userRole: string,
    category: string
  ): PermissionCheck {
    const isAdmin = userRole === 'Admin';

    if (isAdmin) {
      return {
        canAdd: true,
        canEdit: true,
        canDelete: true,
        canApprove: true
      };
    }

    const assignments = this.personnelAssignments.get(category) || [];
    const userAssignment = assignments.find(p => p.email === userEmail);

    if (!userAssignment) {
      return {
        canAdd: false,
        canEdit: false,
        canDelete: false,
        canApprove: false
      };
    }

    return {
      canAdd: userAssignment.permissions.canAdd,
      canEdit: userAssignment.permissions.canEdit,
      canDelete: userAssignment.permissions.canDelete,
      canApprove: false
    };
  }

  /**
   * Get all assigned personnel for a category
   */
  public getPersonnel(category: string): AssignedPersonnel[] {
    return this.personnelAssignments.get(category) || [];
  }

  /**
   * Add personnel assignment
   */
  public addPersonnel(personnel: AssignedPersonnel): void {
    const assignments = this.personnelAssignments.get(personnel.category) || [];
    this.personnelAssignments.set(personnel.category, [...assignments, personnel]);
  }

  /**
   * Remove personnel assignment
   */
  public removePersonnel(category: string, personnelId: string): void {
    const assignments = this.personnelAssignments.get(category) || [];
    this.personnelAssignments.set(
      category,
      assignments.filter(p => p.id !== personnelId)
    );
  }

  /**
   * Update personnel assignment
   */
  public updatePersonnel(personnel: AssignedPersonnel): void {
    const assignments = this.personnelAssignments.get(personnel.category) || [];
    const index = assignments.findIndex(p => p.id === personnel.id);
    
    if (index !== -1) {
      assignments[index] = personnel;
      this.personnelAssignments.set(personnel.category, assignments);
    }
  }

  /**
   * Check if user can perform CRUD operations
   */
  public canPerformCRUD(
    userEmail: string,
    userRole: string,
    category: string
  ): boolean {
    if (userRole === 'Admin') {
      return true;
    }

    const permissions = this.getUserPermissions(userEmail, userRole, category);
    return permissions.canAdd || permissions.canEdit || permissions.canDelete;
  }
}

export const rbacService = RBACService.getInstance();
