export interface QuarterlyData {
  quarter1: number | null;
  quarter2: number | null;
  quarter3: number | null;
  quarter4: number | null;
}

export interface QuarterlyScore {
  quarter1: string; // Format: "accomplished/target" (e.g., "148/200")
  quarter2: string;
  quarter3: string;
  quarter4: string;
}

export interface OrganizationalInfo {
  department: string;
  agencyEntity: string;
  operatingUnit: string;
  organizationCode: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface OutcomeIndicator {
  id: string;
  particular: string;
  description: string;
  uacsCode: string;
  physicalTarget: QuarterlyData;
  physicalAccomplishment: QuarterlyData;
  accomplishmentScore: QuarterlyScore; // Merged ratio field
  varianceAsOf: string;
  variance: number;
  remarks: string;
  budgetYear: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  status?: 'pending' | 'approved' | 'rejected'; // For RBAC approval workflow
  updatedBy?: string; // Track who last updated the entry
}

export interface YearlyAssessment {
  year: number;
  indicators: OutcomeIndicator[];
  organizationalInfo: OrganizationalInfo;
  createdAt: Date;
  updatedAt: Date;
}

// Fixed outcome indicators for Advanced Education Program
export const FIXED_OUTCOME_INDICATORS = {
  GRADUATE_FACULTY_RESEARCH: {
    id: 'graduate-faculty-research',
    particular: 'A. Percentage of graduate school faculty engaged in research work applied in any of the following:',
    description: 'Pursuing advanced research degree programs (Ph.D), or Actively pursuing within the last three (3) years (investigative research, basic and applied scientific research, policy research, social science research), or Producing technologies for commercialization or livelihood improvement, or Whose research work resulted in an extension program.',
    uacsCode: '310200000000',
    shortName: '% of graduate faculty engaged in research work'
  },
  GRADUATE_STUDENTS_RESEARCH: {
    id: 'graduate-students-research', 
    particular: 'B. Percentage of graduate students enrolled in research degree programs.',
    description: 'Percentage of graduate students enrolled in research degree programs',
    uacsCode: '310200000000',
    shortName: '% of graduate students in research programs'
  },
  ACCREDITED_GRADUATE_PROGRAMS: {
    id: 'accredited-graduate-programs',
    particular: 'C. Percentage of accredited graduate programs.',
    description: 'Percentage of accredited graduate programs',
    uacsCode: '310200000000',
    shortName: '% of accredited graduate programs'
  }
} as const;

export const QUARTERS = [
  { id: 'quarter1', label: '1st Quarter', shortLabel: 'Q1' },
  { id: 'quarter2', label: '2nd Quarter', shortLabel: 'Q2' },
  { id: 'quarter3', label: '3rd Quarter', shortLabel: 'Q3' },
  { id: 'quarter4', label: '4th Quarter', shortLabel: 'Q4' }
] as const;

export const calculateAverage = (quarters: QuarterlyData): number => {
  const validQuarters = [quarters.quarter1, quarters.quarter2, quarters.quarter3, quarters.quarter4]
    .filter((q): q is number => q !== null && q !== undefined && q > 0);
  if (validQuarters.length === 0) return 0;
  return validQuarters.reduce((sum, q) => sum + q, 0) / validQuarters.length;
};

export const calculateVariance = (target: number, accomplishment: number): number => {
  return accomplishment - target;
};

export const getVariancePercentage = (target: number, accomplishment: number): number => {
  if (target === 0) return accomplishment > 0 ? 100 : 0;
  return ((accomplishment - target) / target) * 100;
};

export const formatVariance = (variance: number): string => {
  const sign = variance >= 0 ? '+' : '';
  return `${sign}${variance.toFixed(2)}%`;
};

export const getVarianceColor = (variance: number): string => {
  if (variance >= 0) return 'text-green-600';
  if (variance >= -5) return 'text-yellow-600';
  return 'text-red-600';
};

export const getVarianceIcon = (variance: number): string => {
  return variance >= 0 ? '↗' : '↘';
};

export const isQuarterEmpty = (value: number | null): boolean => {
  return value === null || value === undefined || value === 0;
};

export const getValidQuarters = (quarters: QuarterlyData): number[] => {
  return [quarters.quarter1, quarters.quarter2, quarters.quarter3, quarters.quarter4]
    .filter((q): q is number => !isQuarterEmpty(q));
};

export const formatPercentage = (value: number | null): string => {
  if (isQuarterEmpty(value)) return '--';
  return `${value!.toFixed(2)}%`;
};

export const formatQuarterDisplay = (value: number | null): string => {
  if (isQuarterEmpty(value)) return '--';
  return `${value!.toFixed(2)}%`;
};

export const formatAccomplishmentScore = (score: string): string => {
  if (!score || score.trim() === '') return '--';
  return score;
};

export type ViewMode = 'card' | 'list';
export type AnalyticsView = 'all' | 'target' | 'accomplishment' | 'variance';

// Enhanced chart color palette for formal design
export const CHART_COLORS = {
  target: '#64748b', // Slate gray for targets
  accomplishment: '#3b82f6', // Blue for accomplishments
  variance: '#10b981', // Green for positive variance
  varianceNegative: '#ef4444', // Red for negative variance
  gradient: {
    primary: ['#3b82f6', '#1d4ed8'], // Blue gradient
    secondary: ['#64748b', '#475569'], // Gray gradient
    success: ['#10b981', '#059669'], // Green gradient
    warning: ['#f59e0b', '#d97706'], // Orange gradient
    danger: ['#ef4444', '#dc2626'] // Red gradient
  },
  formal: [
    '#2563eb', // Blue
    '#64748b', // Slate
    '#059669', // Emerald
    '#dc2626', // Red
    '#7c3aed', // Violet
    '#ea580c', // Orange
    '#0891b2', // Cyan
    '#be123c'  // Rose
  ]
};