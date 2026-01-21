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
