export interface TeamMember {
  id: string;
  projectId: string;
  name: string;
  email: string;
  phone?: string;
  role: 'project-manager' | 'engineer' | 'foreman' | 'supervisor' | 'contractor' | 'consultant' | 'other';
  department?: string;
  company?: string;
  responsibilities: string[];
  startDate: string;
  endDate?: string;
  status: 'active' | 'inactive' | 'on-leave';
  avatar?: string;
  skills: string[];
  certifications: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RolePermissions {
  role: string;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canManageTeam: boolean;
    canViewFinancials: boolean;
    canUploadDocuments: boolean;
  };
}

export interface TeamActivity {
  id: string;
  memberId: string;
  action: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  membersByRole: Record<string, number>;
  recentActivity: TeamActivity[];
}