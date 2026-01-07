import { NavigationProps } from '../types';

export interface ClassroomAdministrativeOfficePageProps extends NavigationProps {
  currentSection?: string;
}

export interface FacilityStatistics {
  totalSpaces: number;
  classrooms: number;
  adminOffices: number;
  assessmentCompletion: number;
  overallRating: number;
  lastAssessment: string;
  utilizationRate: number;
}

export interface CampusData {
  name: string;
  classrooms: number;
  adminOffices: number;
  totalCapacity: number;
  utilization: number;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  recentUpgrades: number;
}

export interface FeaturedHighlight {
  title: string;
  description: string;
  icon: any;
  color: string;
  metric: string;
}

export interface AssessmentStandard {
  category: string;
  description: string;
  criteria: string[];
  weight: number;
}

export interface RecentInsight {
  title: string;
  description: string;
  date: string;
  type: string;
  impact: 'High' | 'Medium' | 'Low';
  icon: any;
}

export interface UtilizationDataPoint {
  month: string;
  classrooms: number;
  offices: number;
  overall: number;
}

export interface ConditionDistribution {
  name: string;
  value: number;
  color: string;
  percentage: number;
}