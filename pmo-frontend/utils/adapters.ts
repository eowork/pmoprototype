/**
 * Data Adapters - Backend DTO → Frontend UI transformation
 *
 * Per research_summary.md Section 16 (Gap Re-Classification):
 * These adapters resolve field naming mismatches between backend DTOs
 * and frontend UI expectations without requiring backend changes.
 */

// Types matching backend DTOs
export interface BackendProject {
  id: string
  title: string
  campus?: { name: string }
  status: string
  contract_amount?: number
  physical_progress?: number
  fund_source?: { name: string }
  contractor?: { name: string }
  start_date?: string
  end_date?: string
  created_at: string
  updated_at: string
}

export interface BackendUser {
  id: string
  email: string
  first_name: string
  last_name: string
  is_superadmin: boolean
  permissions: string[]
  role?: { name: string }
}

// Frontend UI-expected shapes
export interface UIProject {
  id: string
  projectName: string
  campus: string
  status: string
  totalContractAmount: number
  physicalAccomplishment: number
  fundSource: string
  contractor: string
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
}

export interface UIUser {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  isSuperAdmin: boolean
  permissions: string[]
  roleName: string
}

/**
 * Transform backend project DTO to frontend UI shape
 */
export function adaptProject(backend: BackendProject): UIProject {
  return {
    id: backend.id,
    projectName: backend.title,
    campus: backend.campus?.name || '',
    status: backend.status,
    totalContractAmount: backend.contract_amount || 0,
    physicalAccomplishment: backend.physical_progress || 0,
    fundSource: backend.fund_source?.name || '',
    contractor: backend.contractor?.name || '',
    startDate: backend.start_date || '',
    endDate: backend.end_date || '',
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
  }
}

/**
 * Transform array of backend projects
 */
export function adaptProjects(backendProjects: BackendProject[]): UIProject[] {
  return backendProjects.map(adaptProject)
}

/**
 * Transform backend user DTO to frontend UI shape
 */
export function adaptUser(backend: BackendUser): UIUser {
  return {
    id: backend.id,
    email: backend.email,
    firstName: backend.first_name,
    lastName: backend.last_name,
    fullName: `${backend.first_name} ${backend.last_name}`,
    isSuperAdmin: backend.is_superadmin,
    permissions: backend.permissions || [],
    roleName: backend.role?.name || '',
  }
}

/**
 * Transform frontend UI project back to backend DTO for POST/PUT
 */
export function reverseAdaptProject(ui: Partial<UIProject>): Partial<BackendProject> {
  const result: Partial<BackendProject> = {}

  if (ui.projectName !== undefined) result.title = ui.projectName
  if (ui.status !== undefined) result.status = ui.status
  if (ui.totalContractAmount !== undefined) result.contract_amount = ui.totalContractAmount
  if (ui.physicalAccomplishment !== undefined) result.physical_progress = ui.physicalAccomplishment
  if (ui.startDate !== undefined) result.start_date = ui.startDate
  if (ui.endDate !== undefined) result.end_date = ui.endDate

  return result
}

// ============================================================
// CONSTRUCTION PROJECT DETAIL (Full DTO)
// ============================================================

export interface BackendProjectDetail extends BackendProject {
  project_code: string
  description?: string
  beneficiaries?: string
  objectives?: string[]
  key_features?: string[]
  contract_number?: string
  target_completion_date?: string
  actual_completion_date?: string
  project_duration?: string
  project_engineer?: string
  project_manager?: string
  building_type?: string
  floor_area?: number
  number_of_floors?: number
  subcategory?: { id: string; name: string }
  milestones?: BackendMilestone[]
  financials?: BackendFinancial[]
}

export interface BackendMilestone {
  id: string
  milestone_name: string
  target_date?: string
  actual_date?: string
  weight_percentage?: number
  progress_percentage?: number
  status: string
}

export interface BackendFinancial {
  id: string
  description: string
  amount: number
  date_recorded?: string
  financial_type: string
}

export interface UIProjectDetail extends UIProject {
  projectCode: string
  description: string
  beneficiaries: string
  objectives: string[]
  keyFeatures: string[]
  contractNumber: string
  targetCompletionDate: string
  actualCompletionDate: string
  projectDuration: string
  projectEngineer: string
  projectManager: string
  buildingType: string
  floorArea: number
  numberOfFloors: number
  subcategory: string
  milestones: UIMilestone[]
  financials: UIFinancial[]
}

export interface UIMilestone {
  id: string
  name: string
  targetDate: string
  actualDate: string
  weight: number
  progress: number
  status: string
}

export interface UIFinancial {
  id: string
  description: string
  amount: number
  dateRecorded: string
  type: string
}

export function adaptProjectDetail(backend: BackendProjectDetail): UIProjectDetail {
  return {
    ...adaptProject(backend),
    projectCode: backend.project_code || '',
    description: backend.description || '',
    beneficiaries: backend.beneficiaries || '',
    objectives: backend.objectives || [],
    keyFeatures: backend.key_features || [],
    contractNumber: backend.contract_number || '',
    targetCompletionDate: backend.target_completion_date || '',
    actualCompletionDate: backend.actual_completion_date || '',
    projectDuration: backend.project_duration || '',
    projectEngineer: backend.project_engineer || '',
    projectManager: backend.project_manager || '',
    buildingType: backend.building_type || '',
    floorArea: backend.floor_area || 0,
    numberOfFloors: backend.number_of_floors || 0,
    subcategory: backend.subcategory?.name || '',
    milestones: (backend.milestones || []).map(adaptMilestone),
    financials: (backend.financials || []).map(adaptFinancial),
  }
}

export function adaptMilestone(backend: BackendMilestone): UIMilestone {
  return {
    id: backend.id,
    name: backend.milestone_name,
    targetDate: backend.target_date || '',
    actualDate: backend.actual_date || '',
    weight: backend.weight_percentage || 0,
    progress: backend.progress_percentage || 0,
    status: backend.status,
  }
}

export function adaptFinancial(backend: BackendFinancial): UIFinancial {
  return {
    id: backend.id,
    description: backend.description,
    amount: backend.amount,
    dateRecorded: backend.date_recorded || '',
    type: backend.financial_type,
  }
}

// ============================================================
// UNIVERSITY OPERATIONS
// ============================================================

export interface BackendUniversityOperation {
  id: string
  operation_code: string
  title: string
  description?: string
  operation_type: string
  campus: string
  academic_year: string
  semester?: string
  status: string
  start_date?: string
  end_date?: string
  target_value?: number
  actual_value?: number
  budget_allocated?: number
  budget_utilized?: number
  created_at: string
  updated_at: string
}

export interface UIUniversityOperation {
  id: string
  operationCode: string
  title: string
  description: string
  operationType: string
  campus: string
  academicYear: string
  semester: string
  status: string
  startDate: string
  endDate: string
  targetValue: number
  actualValue: number
  budgetAllocated: number
  budgetUtilized: number
  createdAt: string
  updatedAt: string
}

export function adaptUniversityOperation(backend: BackendUniversityOperation): UIUniversityOperation {
  return {
    id: backend.id,
    operationCode: backend.operation_code,
    title: backend.title,
    description: backend.description || '',
    operationType: backend.operation_type,
    campus: backend.campus,
    academicYear: backend.academic_year,
    semester: backend.semester || '',
    status: backend.status,
    startDate: backend.start_date || '',
    endDate: backend.end_date || '',
    targetValue: backend.target_value || 0,
    actualValue: backend.actual_value || 0,
    budgetAllocated: backend.budget_allocated || 0,
    budgetUtilized: backend.budget_utilized || 0,
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
  }
}

export function adaptUniversityOperations(backendOps: BackendUniversityOperation[]): UIUniversityOperation[] {
  return backendOps.map(adaptUniversityOperation)
}

// ============================================================
// REPAIR PROJECTS
// ============================================================

export interface BackendRepairProject {
  id: string
  repair_code: string
  title: string
  description?: string
  location: string
  campus: string
  urgency_level: string
  status: string
  reported_date?: string
  inspection_date?: string
  approval_date?: string
  start_date?: string
  completion_date?: string
  estimated_cost?: number
  actual_cost?: number
  reported_by?: string
  assigned_to?: string
  physical_progress?: number
  financial_progress?: number
  created_at: string
  updated_at: string
}

export interface UIRepairProject {
  id: string
  repairCode: string
  title: string
  description: string
  location: string
  campus: string
  urgencyLevel: string
  status: string
  reportedDate: string
  inspectionDate: string
  approvalDate: string
  startDate: string
  completionDate: string
  estimatedCost: number
  actualCost: number
  reportedBy: string
  assignedTo: string
  physicalProgress: number
  financialProgress: number
  createdAt: string
  updatedAt: string
}

export function adaptRepairProject(backend: BackendRepairProject): UIRepairProject {
  return {
    id: backend.id,
    repairCode: backend.repair_code,
    title: backend.title,
    description: backend.description || '',
    location: backend.location,
    campus: backend.campus,
    urgencyLevel: backend.urgency_level,
    status: backend.status,
    reportedDate: backend.reported_date || '',
    inspectionDate: backend.inspection_date || '',
    approvalDate: backend.approval_date || '',
    startDate: backend.start_date || '',
    completionDate: backend.completion_date || '',
    estimatedCost: backend.estimated_cost || 0,
    actualCost: backend.actual_cost || 0,
    reportedBy: backend.reported_by || '',
    assignedTo: backend.assigned_to || '',
    physicalProgress: backend.physical_progress || 0,
    financialProgress: backend.financial_progress || 0,
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
  }
}

export function adaptRepairProjects(backendRepairs: BackendRepairProject[]): UIRepairProject[] {
  return backendRepairs.map(adaptRepairProject)
}

// ============================================================
// GAD PARITY
// ============================================================

export interface BackendGADParity {
  id: string
  academic_year: string
  semester: string
  campus: string
  category: string
  male_count: number
  female_count: number
  total_count: number
  parity_index?: number
  created_at: string
  updated_at: string
}

export interface UIGADParity {
  id: string
  academicYear: string
  semester: string
  campus: string
  category: string
  maleCount: number
  femaleCount: number
  totalCount: number
  parityIndex: number
  createdAt: string
  updatedAt: string
}

export function adaptGADParity(backend: BackendGADParity): UIGADParity {
  return {
    id: backend.id,
    academicYear: backend.academic_year,
    semester: backend.semester,
    campus: backend.campus,
    category: backend.category,
    maleCount: backend.male_count,
    femaleCount: backend.female_count,
    totalCount: backend.total_count,
    parityIndex: backend.parity_index || 0,
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
  }
}

export function adaptGADParityList(backendList: BackendGADParity[]): UIGADParity[] {
  return backendList.map(adaptGADParity)
}
