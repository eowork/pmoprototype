/**
 * Team Tab - Project Personnel Management
 * 
 * Simplified team management using the AssignedPersonnelManager component
 * which includes:
 * - RBAC-controlled personnel assignment
 * - Creator protection (prevents removal of project creator)
 * - Role-based permissions (Admin, Project Manager, Director can manage)
 * - Search and filter capabilities
 */

import React from 'react';
import { AssignedPersonnelManager } from '../../admin/AssignedPersonnelManager';
import { TeamMember } from '../../types/ProjectDetailTypes';
import { MEFilter } from '../../types/METypes';

interface TeamTabProps {
  teamMembers: TeamMember[];
  filteredTeamMembers: TeamMember[];
  globalMEFilter: MEFilter;
  onFilterChange: (filter: MEFilter) => void;
  onClearFilter: () => void;
  projectId: string;
  projectTitle?: string;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  currentUserEmail?: string;
  currentUserRole?: string;
  onAddTeamMember: (memberData: {
    name: string;
    role: string;
    department: string;
    avatar?: string;
  }) => void;
  onEditTeamMember: (member: TeamMember) => void;
  onDeleteTeamMember: (id: string) => void;
}

export function TeamTab({
  projectId,
  projectTitle = 'Project',
  currentUserEmail = 'user@carsu.edu.ph',
  currentUserRole = 'Client'
}: TeamTabProps) {

  return (
    <div className="space-y-6">
      {/* Assigned Personnel Manager - Primary team management with RBAC controls */}
      <AssignedPersonnelManager
        projectId={projectId}
        projectTitle={projectTitle}
        currentUserEmail={currentUserEmail}
        currentUserRole={currentUserRole}
        onPersonnelUpdate={(personnel) => {
          console.log('Personnel updated:', personnel);
          // Handle personnel update if needed
        }}
      />
    </div>
  );
}