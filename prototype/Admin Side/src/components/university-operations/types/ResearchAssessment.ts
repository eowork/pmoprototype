// Research Assessment types for Research Program
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

export interface ResearchAssessment {
  id: string;
  particular: string;
  uacsCode: string;
  physicalTarget: QuarterlyData;
  physicalAccomplishment: QuarterlyData;
  accomplishmentScore: AccomplishmentScore;
  varianceAsOf: string;
  variance: number;
  remarks: string;
  
  // Research-specific fields
  researchOutput?: number;
  publications?: number;
  patents?: number;
  citations?: number;
  collaborations?: string;
  fundingSource?: string;
  researchArea?: string;
  
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

// Fixed Research Indicators for standardized assessment
export const FIXED_RESEARCH_INDICATORS = {
  RES_001: {
    id: 'res_001',
    particular: 'A. Number of research outputs in the last three (3) years utilized by the industry or other beneficiaries.',
    description: 'Number of research outputs in the last three (3) years utilized by the industry or other beneficiaries',
    shortName: 'Research outputs utilized by industry/beneficiaries'
  },
  RES_002: {
    id: 'res_002', 
    particular: 'B. Number of research outputs completed within the year.',
    description: 'Number of research outputs completed within the year',
    shortName: 'Research outputs completed'
  },
  RES_003: {
    id: 'res_003',
    particular: 'C. Percentage of research outputs published in internationally refereed or CHED-recognized journals within the year.',
    description: 'Percentage of research outputs published in internationally refereed or CHED-recognized journals within the year',
    shortName: 'Research outputs in refereed journals'
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