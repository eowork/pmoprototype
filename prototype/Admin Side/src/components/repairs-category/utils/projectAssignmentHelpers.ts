/**
 * Repair Project Assignment Helper Utilities
 * Provides functions to check project assignment status and shared assignments
 */

import { enhancedRepairsRBACService } from '../services/EnhancedRBACService';

/**
 * Check if a project is shared among multiple staff members
 */
export function isProjectShared(projectId: string): boolean {
  const assignments = enhancedRepairsRBACService.getProjectStaff(projectId);
  return assignments.length > 1;
}

/**
 * Get all staff members assigned to a project
 */
export function getProjectAssignees(projectId: string): string[] {
  const assignments = enhancedRepairsRBACService.getProjectStaff(projectId);
  return assignments.map(a => a.staffName);
}

/**
 * Check if current user has access to a project
 */
export function hasProjectAccess(
  projectId: string,
  userEmail: string,
  userRole: string
): boolean {
  // Admin has access to all
  if (userRole === 'Admin') {
    return true;
  }

  // Check if user is assigned to this project
  const assignments = enhancedRepairsRBACService.getAssignedProjects(userEmail);
  return assignments.some(a => a.projectId === projectId);
}

/**
 * Get project assignment status for display
 */
export function getProjectAssignmentStatus(
  projectId: string,
  userEmail: string,
  userRole: string
): {
  isShared: boolean;
  isExclusive: boolean;
  assigneeCount: number;
  assignees: string[];
  hasAccess: boolean;
} {
  const assignments = enhancedRepairsRBACService.getProjectStaff(projectId);
  const assignees = assignments.map(a => a.staffName);
  const isShared = assignments.length > 1;
  const hasAccess = hasProjectAccess(projectId, userEmail, userRole);

  return {
    isShared,
    isExclusive: !isShared && assignments.length === 1,
    assigneeCount: assignments.length,
    assignees,
    hasAccess
  };
}

/**
 * Format assignee list for tooltip
 */
export function formatAssigneeList(assignees: string[]): string {
  if (assignees.length === 0) return 'No assignments';
  if (assignees.length === 1) return assignees[0];
  if (assignees.length === 2) return `${assignees[0]} and ${assignees[1]}`;
  
  const others = assignees.length - 2;
  return `${assignees[0]}, ${assignees[1]} and ${others} other${others > 1 ? 's' : ''}`;
}
