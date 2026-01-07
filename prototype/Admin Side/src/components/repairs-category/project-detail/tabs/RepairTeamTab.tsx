/**
 * Repair Team Tab - Project Personnel Management
 * 
 * Exclusive for Repairs Category
 * Simplified team management using the RepairAssignedPersonnelManager component
 * which includes:
 * - RBAC-controlled personnel assignment
 * - Creator protection (prevents removal of project creator)
 * - Role-based permissions (Admin, Project Manager, Director can manage)
 * - Search and filter capabilities
 * 
 * This is a complete copy exclusive to repairs category to maintain independence
 * from construction infrastructure components as per requirements.
 */

import React from 'react';
import { RepairAssignedPersonnelManager } from '../../admin/RepairAssignedPersonnelManager';
import { TeamMember } from '../../../construction-infrastructure/types/ProjectDetailTypes';
import { MEFilter } from '../../../construction-infrastructure/types/METypes';

interface RepairTeamTabProps {
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

export function RepairTeamTab({
  projectId,
  projectTitle = 'Repair Project',
  currentUserEmail = 'user@carsu.edu.ph',
  currentUserRole = 'Client'
}: RepairTeamTabProps) {

  return (
    <div className="space-y-6">
      {/* Repair Assigned Personnel Manager - Primary team management with RBAC controls */}
      <RepairAssignedPersonnelManager
        projectId={projectId}
        projectTitle={projectTitle}
        currentUserEmail={currentUserEmail}
        currentUserRole={currentUserRole}
        onPersonnelUpdate={(personnel) => {
          console.log('Repair project personnel updated:', personnel);
          // Handle personnel update if needed
        }}
      />
    </div>
  );
}
