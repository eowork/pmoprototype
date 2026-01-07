// Extension Assessment types for Technical Advisory Extension Program
export interface QuarterlyData {
  quarter1: number | null;
  quarter2: number | null;
  quarter3: number | null;
  quarter4: number | null;
}

export interface AccomplishmentScore {
  quarter1: string;
  quarter2: string;
  quarter3: string;
  quarter4: string;
}

export interface ExtensionAssessment {
  id: string;
  particular: string;
  uacsCode: string;
  physicalTarget: QuarterlyData;
  physicalAccomplishment: QuarterlyData;
  accomplishmentScore: AccomplishmentScore;
  varianceAsOf: string;
  variance: number;
  remarks: string;
  
  // Extension-specific fields
  beneficiaries?: number;
  communityProjects?: number;
  trainingsProvided?: number;
  practitioners?: number;
  impactScore?: number;
  communityPartners?: string;
  extensionArea?: string;
  targetSector?: string;
  
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface OrganizationalInfo {
  id?: string;
  department: string;
  agencyEntity: string;
  operatingUnit: string;
  organizationCode: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AnalyticsView = 'all' | 'target' | 'accomplishment' | 'variance';

// Fixed Extension Indicators for standardized assessment
export const FIXED_EXTENSION_INDICATORS = {
  EXT_001: {
    id: 'ext_001',
    particular: 'A. Number of trainees weighted by the length of training.',
    description: 'Number of trainees weighted by the length of training',
    shortName: 'Trainees weighted by training length'
  },
  EXT_002: {
    id: 'ext_002', 
    particular: 'B. Number of extension programs organized and supported consistent with the SUC\'s mandated and priority programs.',
    description: 'Number of extension programs organized and supported consistent with the SUC\'s mandated and priority programs',
    shortName: 'Extension programs organized'
  },
  EXT_003: {
    id: 'ext_003',
    particular: 'C. Percentage of beneficiaries who rate the training course/s as satisfactory or higher in terms of quality and relevance.',
    description: 'Percentage of beneficiaries who rate the training course/s as satisfactory or higher in terms of quality and relevance',
    shortName: 'Beneficiaries satisfaction rating'
  }
} as const;

// Helper functions
export const calculateAverage = (data: QuarterlyData): number => {
  const values = Object.values(data).filter(v => v !== null) as number[];
  return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
};

export const calculateVariance = (target: QuarterlyData, actual: QuarterlyData): number => {
  const avgTarget = calculateAverage(target);
  const avgActual = calculateAverage(actual);
  return avgActual - avgTarget;
};