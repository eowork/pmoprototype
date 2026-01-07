// Types for Repair Category Projects

export interface RepairProject {
  id: string;
  title: string;
  description: string;
  campus: 'Main Campus' | 'Cabadbaran Campus' | 'CSU Main' | 'CSU CC' | 'CSU' | 'BXU';
  building: string;
  location: string;
  repairType: 'Structural' | 'Electrical' | 'Plumbing' | 'HVAC' | 'Roofing' | 'Painting' | 'Flooring' | 'Safety' | 'Security' | 'Other';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | 'On Hold' | 'Overdue';
  startDate: string;
  endDate: string;
  estimatedDuration?: number; // in days
  actualDuration?: number; // in days
  budget: number;
  spent: number;
  contractor?: string;
  projectManager: string;
  assignedTeam?: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  images?: RepairImage[];
  documents?: RepairDocument[];
  materials?: Material[];
  workOrders?: WorkOrder[];
  inspectionReports?: InspectionReport[];
  tags?: string[];
  notes?: string;
  emergencyRepair: boolean;
  warrantyPeriod?: number; // in months
  maintenanceSchedule?: MaintenanceSchedule;
}

export interface RepairImage {
  id: string;
  url: string;
  caption: string;
  type: 'before' | 'during' | 'after' | 'inspection';
  uploadedAt: string;
  uploadedBy: string;
}

export interface RepairDocument {
  id: string;
  name: string;
  type: 'work_order' | 'invoice' | 'permit' | 'inspection' | 'warranty' | 'contract' | 'other';
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  size: number;
}

export interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  supplier?: string;
  deliveryDate?: string;
  status: 'ordered' | 'delivered' | 'used' | 'returned';
}

export interface WorkOrder {
  id: string;
  orderNumber: string;
  description: string;
  assignedTo: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  scheduledDate: string;
  completedAt?: string;
  estimatedHours: number;
  actualHours?: number;
  notes?: string;
}

export interface InspectionReport {
  id: string;
  inspector: string;
  inspectionDate: string;
  type: 'pre_work' | 'progress' | 'final' | 'safety' | 'quality';
  status: 'passed' | 'failed' | 'conditional';
  findings: string;
  recommendations?: string;
  nextInspectionDate?: string;
  images?: string[];
  signOffRequired: boolean;
  signedOff: boolean;
  signedBy?: string;
  signedAt?: string;
}

export interface MaintenanceSchedule {
  id: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  nextMaintenanceDate: string;
  maintenanceType: string;
  assignedTo?: string;
  notes?: string;
}

export interface RepairStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
  totalBudget: number;
  spentBudget: number;
  completionRate: number;
  averageDuration?: number;
  onTimeCompletionRate?: number;
  budgetUtilizationRate?: number;
}

export interface CampusRepairSummary {
  campus: string;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  spentBudget: number;
  urgentRepairs: number;
  averageCompletionTime: number;
  topRepairTypes: { type: string; count: number }[];
  mostActiveBuildings: { building: string; count: number }[];
}

export interface RepairFilter {
  campus?: string;
  status?: string;
  repairType?: string;
  priority?: string;
  building?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  budgetRange?: {
    min: number;
    max: number;
  };
  searchTerm?: string;
}

export interface RepairFormData {
  title: string;
  description: string;
  campus: string;
  building: string;
  location: string;
  repairType: string;
  priority: string;
  status: string;
  startDate: string;
  endDate: string;
  budget: number;
  contractor?: string;
  projectManager: string;
  emergencyRepair: boolean;
  notes?: string;
  tags?: string[];
}

// Utility type for repair project creation
export type CreateRepairProject = Omit<RepairProject, 'id' | 'createdAt' | 'updatedAt' | 'spent'>;

// Utility type for repair project updates
export type UpdateRepairProject = Partial<Omit<RepairProject, 'id' | 'createdAt'>>;

// Constants for repair types and priorities
export const REPAIR_TYPES = [
  'Structural',
  'Electrical', 
  'Plumbing',
  'HVAC',
  'Roofing',
  'Painting',
  'Flooring',
  'Safety',
  'Security',
  'Other'
] as const;

export const REPAIR_PRIORITIES = [
  'Low',
  'Medium', 
  'High',
  'Critical'
] as const;

export const REPAIR_STATUSES = [
  'Pending',
  'In Progress',
  'Completed',
  'Cancelled',
  'On Hold',
  'Overdue'
] as const;

export const CAMPUS_OPTIONS = [
  'Main Campus',
  'Cabadbaran Campus',
  'CSU Main', 
  'CSU CC'
] as const;