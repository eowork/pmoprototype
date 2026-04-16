/**
 * Data Adapters - Backend DTO → Frontend UI transformation
 *
 * Per research_summary.md Section 16 (Gap Re-Classification):
 * These adapters resolve field naming mismatches between backend DTOs
 * and frontend UI expectations without requiring backend changes.
 */

// Publication status type for draft governance
export type PublicationStatus = 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED'

// Approval metadata interface for draft governance workflow
export interface ApprovalMetadata {
  createdBy: string | null
  createdByName: string | null
  createdAt: string | null
  submittedBy: string | null
  submittedByName: string | null
  submittedAt: string | null
  reviewedBy: string | null
  reviewedByName: string | null
  reviewedAt: string | null
  reviewNotes: string | null
}

// Types matching backend DTOs (flat fields from SQL JOIN)
export interface BackendProject {
  id: string
  title: string
  campus?: string
  status: string
  contract_amount?: number
  physical_progress?: number
  funding_source_id?: string
  funding_source_name?: string
  contractor_id?: string
  contractor_name?: string
  start_date?: string
  end_date?: string
  publication_status?: PublicationStatus
  created_by?: string
  created_by_name?: string
  created_at: string
  updated_at: string
  // Approval metadata fields
  submitted_by?: string
  submitted_by_name?: string
  submitted_at?: string
  reviewed_by?: string
  reviewed_by_name?: string
  reviewed_at?: string
  review_notes?: string
  // Phase AE: Record-level delegation (legacy single)
  assigned_to?: string
  assigned_to_name?: string
  // Phase AW: Multi-select assignment
  assigned_users?: { id: string; name: string }[]
}

export interface BackendUser {
  id: string
  email: string
  first_name: string
  last_name: string
  is_superadmin: boolean
  permissions: string[]
  module_overrides?: Record<string, boolean>
  module_assignments?: string[]
  pillar_assignments?: string[]  // Phase HN: pillar-based tab access
  rank_level?: number
  campus?: string  // Phase Y: Office-scoped visibility
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
  publicationStatus: PublicationStatus
  createdBy: string
  createdAt: string
  updatedAt: string
  approvalMetadata: ApprovalMetadata
  // Phase AE: Record-level delegation (legacy)
  delegatedTo: string
  delegatedToName: string
  // Phase AW: Multi-select assignment
  assignedUsers: { id: string; name: string }[]
}

export interface UIUser {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  isSuperAdmin: boolean
  permissions: string[]
  moduleOverrides: Record<string, boolean>
  moduleAssignments: string[]
  pillarAssignments: string[]  // Phase HN: pillar-based tab access
  rankLevel: number
  campus: string  // Phase Y: Office-scoped visibility
  roleName: string
}

/**
 * Transform backend project DTO to frontend UI shape
 */
export function adaptProject(backend: BackendProject): UIProject {
  return {
    id: backend.id,
    projectName: backend.title,
    campus: backend.campus || '',
    status: backend.status,
    totalContractAmount: backend.contract_amount || 0,
    physicalAccomplishment: backend.physical_progress || 0,
    fundSource: backend.funding_source_name || '',
    contractor: backend.contractor_name || '',
    startDate: backend.start_date || '',
    endDate: backend.end_date || '',
    publicationStatus: backend.publication_status || 'PUBLISHED',
    createdBy: backend.created_by || '',
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
    approvalMetadata: {
      createdBy: backend.created_by || null,
      createdByName: backend.created_by_name || null,
      createdAt: backend.created_at || null,
      submittedBy: backend.submitted_by || null,
      submittedByName: backend.submitted_by_name || null,
      submittedAt: backend.submitted_at || null,
      reviewedBy: backend.reviewed_by || null,
      reviewedByName: backend.reviewed_by_name || null,
      reviewedAt: backend.reviewed_at || null,
      reviewNotes: backend.review_notes || null,
    },
    // Phase AE: Record-level delegation (legacy)
    delegatedTo: backend.assigned_to || '',
    delegatedToName: backend.assigned_to_name || '',
    // Phase AW: Multi-select assignment
    assignedUsers: backend.assigned_users || [],
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
    moduleOverrides: backend.module_overrides || {},
    moduleAssignments: backend.module_assignments || [],
    pillarAssignments: backend.pillar_assignments || [],
    rankLevel: backend.rank_level ?? 100,
    campus: backend.campus || '',  // Phase Y: Office-scoped visibility
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
  publication_status?: PublicationStatus
  created_by?: string
  created_by_name?: string
  created_at: string
  updated_at: string
  // Approval metadata fields
  submitted_by?: string
  submitted_by_name?: string
  submitted_at?: string
  reviewed_by?: string
  reviewed_by_name?: string
  reviewed_at?: string
  review_notes?: string
  // Phase AE: Record-level delegation (legacy single)
  assigned_to?: string
  assigned_to_name?: string
  // Phase AW: Multi-select assignment
  assigned_users?: { id: string; name: string }[]
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
  publicationStatus: PublicationStatus
  createdBy: string
  createdAt: string
  updatedAt: string
  approvalMetadata: ApprovalMetadata
  // Phase AE: Record-level delegation (legacy)
  delegatedTo: string
  delegatedToName: string
  // Phase AW: Multi-select assignment
  assignedUsers: { id: string; name: string }[]
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
    publicationStatus: backend.publication_status || 'PUBLISHED',
    createdBy: backend.created_by || '',
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
    approvalMetadata: {
      createdBy: backend.created_by || null,
      createdByName: backend.created_by_name || null,
      createdAt: backend.created_at || null,
      submittedBy: backend.submitted_by || null,
      submittedByName: backend.submitted_by_name || null,
      submittedAt: backend.submitted_at || null,
      reviewedBy: backend.reviewed_by || null,
      reviewedByName: backend.reviewed_by_name || null,
      reviewedAt: backend.reviewed_at || null,
      reviewNotes: backend.review_notes || null,
    },
    // Phase AE: Record-level delegation (legacy)
    delegatedTo: backend.assigned_to || '',
    delegatedToName: backend.assigned_to_name || '',
    // Phase AW: Multi-select assignment
    assignedUsers: backend.assigned_users || [],
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
  project_code: string
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
  end_date?: string
  budget?: number
  actual_cost?: number
  created_by?: string
  created_by_name?: string
  // Approval metadata fields
  submitted_by?: string
  submitted_by_name?: string
  submitted_at?: string
  reviewed_by?: string
  reviewed_by_name?: string
  reviewed_at?: string
  review_notes?: string
  reported_by?: string
  assigned_technician?: string
  physical_progress?: number
  financial_progress?: number
  publication_status?: PublicationStatus
  created_at: string
  updated_at: string
  // Phase AE: Record-level delegation (legacy single)
  assigned_to?: string
  assigned_to_name?: string
  // Phase AW: Multi-select assignment
  assigned_users?: { id: string; name: string }[]
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
  publicationStatus: PublicationStatus
  createdBy: string
  createdAt: string
  updatedAt: string
  approvalMetadata: ApprovalMetadata
  // Phase AE: Record-level delegation (legacy)
  delegatedTo: string
  delegatedToName: string
  // Phase AW: Multi-select assignment
  assignedUsers: { id: string; name: string }[]
}

export function adaptRepairProject(backend: BackendRepairProject): UIRepairProject {
  return {
    id: backend.id,
    repairCode: backend.project_code,
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
    completionDate: backend.end_date || '',
    estimatedCost: backend.budget || 0,
    actualCost: backend.actual_cost || 0,
    reportedBy: backend.reported_by || '',
    assignedTo: backend.assigned_technician || '',
    physicalProgress: backend.physical_progress || 0,
    financialProgress: backend.financial_progress || 0,
    publicationStatus: backend.publication_status || 'PUBLISHED',
    createdBy: backend.created_by || '',
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
    approvalMetadata: {
      createdBy: backend.created_by || null,
      createdByName: backend.created_by_name || null,
      createdAt: backend.created_at || null,
      submittedBy: backend.submitted_by || null,
      submittedByName: backend.submitted_by_name || null,
      submittedAt: backend.submitted_at || null,
      reviewedBy: backend.reviewed_by || null,
      reviewedByName: backend.reviewed_by_name || null,
      reviewedAt: backend.reviewed_at || null,
      reviewNotes: backend.review_notes || null,
    },
    // Phase AE: Record-level delegation (legacy)
    delegatedTo: backend.assigned_to || '',
    delegatedToName: backend.assigned_to_name || '',
    // Phase AW: Multi-select assignment
    assignedUsers: backend.assigned_users || [],
  }
}

export function adaptRepairProjects(backendRepairs: BackendRepairProject[]): UIRepairProject[] {
  return backendRepairs.map(adaptRepairProject)
}

// ============================================================
// REPAIR PROJECT DETAIL (Extended with nested objects for edit forms)
// ============================================================

export interface BackendRepairProjectDetail extends BackendRepairProject {
  repair_type_id?: string
  repair_type_name?: string
  building_name?: string
  floor_number?: string
  room_number?: string
  specific_location?: string
  is_emergency?: boolean
}

export interface UIRepairDetail {
  id: string
  project_code: string
  title: string
  description: string
  building_name: string
  floor_number: string
  room_number: string
  specific_location: string
  repair_type_id: string
  urgency_level: string
  is_emergency: boolean
  campus: string
  status: string
  reported_by: string
  inspection_date: string
  start_date: string
  end_date: string
  budget: number | null
  actual_cost: number | null
  assigned_technician: string
  // Draft governance fields (for detail view)
  repairCode: string
  createdBy: string
  publicationStatus: PublicationStatus
  approvalMetadata: ApprovalMetadata
  // Phase AE: Record-level delegation (legacy)
  delegatedTo: string
  delegatedToName: string
  // Phase AW: Multi-select assignment
  assignedUsers: { id: string; name: string }[]
  assignedUserIds: string[]
}

/**
 * Transform backend repair detail to frontend form shape
 * Used for edit forms to extract nested object IDs
 */
export function adaptRepairDetail(backend: BackendRepairProjectDetail): UIRepairDetail {
  return {
    id: backend.id,
    project_code: backend.project_code || '',
    title: backend.title || '',
    description: backend.description || '',
    building_name: backend.building_name || backend.location || '',
    floor_number: backend.floor_number || '',
    room_number: backend.room_number || '',
    specific_location: backend.specific_location || '',
    repair_type_id: backend.repair_type_id || '',
    urgency_level: backend.urgency_level || '',
    is_emergency: backend.is_emergency || false,
    campus: backend.campus || '',
    status: backend.status || '',
    reported_by: backend.reported_by || '',
    inspection_date: backend.inspection_date ? backend.inspection_date.split('T')[0] : '',
    start_date: backend.start_date ? backend.start_date.split('T')[0] : '',
    end_date: backend.end_date ? backend.end_date.split('T')[0] : '',
    budget: backend.budget || null,
    actual_cost: backend.actual_cost || null,
    assigned_technician: backend.assigned_technician || '',
    // Draft governance fields
    repairCode: backend.project_code || '',
    createdBy: backend.created_by || '',
    publicationStatus: backend.publication_status || 'PUBLISHED',
    approvalMetadata: {
      createdBy: backend.created_by || null,
      createdByName: backend.created_by_name || null,
      createdAt: backend.created_at || null,
      submittedBy: backend.submitted_by || null,
      submittedByName: backend.submitted_by_name || null,
      submittedAt: backend.submitted_at || null,
      reviewedBy: backend.reviewed_by || null,
      reviewedByName: backend.reviewed_by_name || null,
      reviewedAt: backend.reviewed_at || null,
      reviewNotes: backend.review_notes || null,
    },
    // Phase AE: Record-level delegation (legacy)
    delegatedTo: backend.assigned_to || '',
    delegatedToName: backend.assigned_to_name || '',
    // Phase AW: Multi-select assignment
    assignedUsers: (backend as any).assigned_users || [],
    assignedUserIds: ((backend as any).assigned_users || []).map((u: { id: string }) => u.id),
  }
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

// ============================================================
// CONTRACTORS (Reference Data)
// ============================================================

export interface BackendContractor {
  id: string
  name: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  tin_number?: string
  registration_number?: string
  validity_date?: string
  status: string
  created_at: string
  updated_at: string
}

export interface UIContractor {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  tinNumber: string
  registrationNumber: string
  validityDate: string
  status: string
  createdAt: string
  updatedAt: string
}

export function adaptContractor(backend: BackendContractor): UIContractor {
  return {
    id: backend.id,
    name: backend.name,
    contactPerson: backend.contact_person || '',
    email: backend.email || '',
    phone: backend.phone || '',
    address: backend.address || '',
    tinNumber: backend.tin_number || '',
    registrationNumber: backend.registration_number || '',
    validityDate: backend.validity_date ? backend.validity_date.split('T')[0] : '',
    status: backend.status,
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
  }
}

export function adaptContractors(backendList: BackendContractor[]): UIContractor[] {
  return backendList.map(adaptContractor)
}

export function reverseAdaptContractor(ui: Partial<UIContractor>): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  if (ui.name !== undefined) result.name = ui.name
  if (ui.contactPerson !== undefined) result.contact_person = ui.contactPerson || undefined
  if (ui.email !== undefined) result.email = ui.email || undefined
  if (ui.phone !== undefined) result.phone = ui.phone || undefined
  if (ui.address !== undefined) result.address = ui.address || undefined
  if (ui.tinNumber !== undefined) result.tin_number = ui.tinNumber || undefined
  if (ui.registrationNumber !== undefined) result.registration_number = ui.registrationNumber || undefined
  if (ui.validityDate !== undefined) result.validity_date = ui.validityDate || undefined
  if (ui.status !== undefined) result.status = ui.status

  return result
}

// ============================================================
// FUNDING SOURCES (Reference Data)
// ============================================================

export interface BackendFundingSource {
  id: string
  name: string
  description?: string
  source_type?: string
  created_at: string
  updated_at: string
}

export interface UIFundingSource {
  id: string
  name: string
  description: string
  sourceType: string
  createdAt: string
  updatedAt: string
}

export function adaptFundingSource(backend: BackendFundingSource): UIFundingSource {
  return {
    id: backend.id,
    name: backend.name,
    description: backend.description || '',
    sourceType: backend.source_type || '',
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
  }
}

export function adaptFundingSources(backendList: BackendFundingSource[]): UIFundingSource[] {
  return backendList.map(adaptFundingSource)
}

export function reverseAdaptFundingSource(ui: Partial<UIFundingSource>): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  if (ui.name !== undefined) result.name = ui.name
  if (ui.description !== undefined) result.description = ui.description || undefined
  if (ui.sourceType !== undefined) result.source_type = ui.sourceType || undefined

  return result
}

// ============================================================
// USERS (User Management)
// ============================================================

export interface BackendUserRole {
  id: string
  name: string
  is_superadmin: boolean
}

export interface BackendUserList {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  avatar_url?: string
  is_active: boolean
  last_login_at?: string
  rank_level?: number
  campus?: string
  created_at: string
  updated_at: string
  roles: BackendUserRole[]
}

export interface UIUserList {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  phone: string
  avatarUrl: string
  isActive: boolean
  lastLoginAt: string
  rankLevel: number
  campus: string
  createdAt: string
  updatedAt: string
  roles: string[]
  isSuperAdmin: boolean
}

export function adaptUserList(backend: BackendUserList): UIUserList {
  const roleNames = backend.roles?.map(r => r.name) || []
  const isSuperAdmin = backend.roles?.some(r => r.is_superadmin) || false

  return {
    id: backend.id,
    email: backend.email,
    firstName: backend.first_name,
    lastName: backend.last_name,
    fullName: `${backend.first_name} ${backend.last_name}`,
    phone: backend.phone || '',
    avatarUrl: backend.avatar_url || '',
    isActive: backend.is_active,
    lastLoginAt: backend.last_login_at || '',
    rankLevel: backend.rank_level || 100,
    campus: backend.campus || '',
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
    roles: roleNames,
    isSuperAdmin,
  }
}

export function adaptUsersList(backendList: BackendUserList[]): UIUserList[] {
  return backendList.map(adaptUserList)
}
