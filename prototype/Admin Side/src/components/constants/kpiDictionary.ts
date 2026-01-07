// KPI Dictionary for Data Governance
// Maintains centralized definitions for all Key Performance Indicators

export interface KPIDefinition {
  id: string;
  name: string;
  owner: string;
  formula: string;
  unit: string;
  source: string;
  frequency: string;
  description: string;
  category: string;
  status: 'active' | 'pending' | 'deprecated';
  lastUpdated: string;
}

export const KPI_REGISTRY: Record<string, KPIDefinition> = {
  'project-completion-rate': {
    id: 'project-completion-rate',
    name: 'Project Completion Rate',
    owner: 'PMO Data Team',
    formula: '(Completed Projects ÷ Total Scheduled Projects) × 100',
    unit: 'percentage',
    source: 'Project tracking system, milestone reports',
    frequency: 'Monthly',
    description: 'Percentage of projects completed within scheduled timeframes',
    category: 'Operational',
    status: 'active',
    lastUpdated: '2024-01-15'
  },
  'target-achievement': {
    id: 'target-achievement',
    name: 'Target Achievement',
    owner: 'Strategic Planning',
    formula: '(Sum of Category Accomplishments ÷ Number of Categories)',
    unit: 'percentage',
    source: 'Quarterly assessment reports, category evaluations',
    frequency: 'Quarterly',
    description: 'Overall accomplishment rate across all project categories',
    category: 'Strategic',
    status: 'active',
    lastUpdated: '2024-01-14'
  },
  'data-entry-timeliness': {
    id: 'data-entry-timeliness',
    name: 'Data Entry Timeliness',
    owner: 'Data Quality Team',
    formula: '(Entries Updated This Month ÷ Total Required Entries) × 100',
    unit: 'percentage',
    source: 'System timestamps, data entry logs',
    frequency: 'Monthly',
    description: 'Percentage of data entries updated within required timeframes',
    category: 'Quality',
    status: 'active',
    lastUpdated: '2024-01-15'
  },
  'data-completeness': {
    id: 'data-completeness',
    name: 'Data Completeness',
    owner: 'Data Quality Team',
    formula: '(Filled Fields ÷ Total Required Fields) × 100',
    unit: 'percentage',
    source: 'Database field validation',
    frequency: 'Daily',
    description: 'Percentage of required data fields that are populated',
    category: 'Quality',
    status: 'active',
    lastUpdated: '2024-01-15'
  }
};

// Helper functions for KPI management
export const getKPIDefinition = (kpiId: string): KPIDefinition | null => {
  return KPI_REGISTRY[kpiId] || null;
};

export const isKPIDefined = (kpiId: string): boolean => {
  const kpi = getKPIDefinition(kpiId);
  return kpi !== null && kpi.status === 'active';
};

export const getActiveKPIs = (): KPIDefinition[] => {
  return Object.values(KPI_REGISTRY).filter(kpi => kpi.status === 'active');
};

export const getPendingKPIs = (): KPIDefinition[] => {
  return Object.values(KPI_REGISTRY).filter(kpi => kpi.status === 'pending');
};

// Mock data for undefined KPIs (charts that need definition)
export const UNDEFINED_CHARTS = [
  {
    id: 'budget-variance',
    name: 'Budget Variance Trend',
    description: 'Monthly budget variance across categories',
    needsDefinition: true,
    category: 'Financial'
  },
  {
    id: 'resource-utilization',
    name: 'Resource Utilization',
    description: 'Personnel and equipment utilization rates',
    needsDefinition: true,
    category: 'Resource'
  },
  {
    id: 'stakeholder-engagement',
    name: 'Stakeholder Engagement Score',
    description: 'Quarterly stakeholder engagement metrics',
    needsDefinition: true,
    category: 'Engagement'
  }
];