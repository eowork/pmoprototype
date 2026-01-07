// Assessment Types for Classroom and Administrative Offices

export interface AssessmentCriteria {
  name: string;
  weight: number;
  description: string;
}

export interface ClassroomAssessment {
  id: string;
  roomNumber: string;
  campus: string;
  college: string;
  building: string;
  capacity: number;
  assessmentDate: string;
  assessor: string;
  overallScore: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  scores: {
    spaceUtilization: number;
    facilityCondition: number;
    equipmentStatus: number;
    accessibility: number;
    safetySecurity: number;
  };
  recommendations: string[];
  status: 'Assessed' | 'Pending' | 'In Progress' | 'Scheduled';
  nextReview: string;
}

export interface AdminOfficeAssessment {
  id: string;
  officeName: string;
  campus: string;
  department: string;
  building: string;
  staffCount: number;
  assessmentDate: string;
  assessor: string;
  overallScore: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  scores: {
    workflowEfficiency: number;
    spaceAllocation: number;
    technologyIntegration: number;
    ergonomics: number;
    clientServiceArea: number;
  };
  recommendations: string[];
  status: 'Assessed' | 'Pending' | 'In Progress' | 'Scheduled';
  nextReview: string;
}

export interface PrioritizationItem {
  id: string;
  title: string;
  campus: string;
  category: 'Infrastructure' | 'Technology' | 'Student Services' | 'Academic' | 'Administrative';
  department: string;
  impactScore: number;
  urgencyScore: number;
  priorityLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  resourceRequirement: 'High' | 'Medium' | 'Low';
  estimatedCost: number;
  timeframe: string;
  stakeholders: string[];
  benefits: string[];
  risks: string[];
  assessmentDate: string;
  assessor: string;
  status: 'Approved' | 'Under Review' | 'Planning' | 'Proposed' | 'Deferred';
  nextReview: string;
}

export interface CampusData {
  totalRooms?: number;
  totalOffices?: number;
  assessedRooms?: number;
  assessedOffices?: number;
  avgScore: number;
  utilizationRate?: number;
  efficiencyRate?: number;
  priorityItems: number;
  colleges?: CollegeData[];
  departments?: DepartmentData[];
}

export interface CollegeData {
  name: string;
  rooms: number;
  avgScore: number;
  utilization: number;
}

export interface DepartmentData {
  name: string;
  offices: number;
  avgScore: number;
  efficiency: number;
}

export interface AssessmentCategory {
  id: string;
  name: string;
  icon: any;
  description: string;
  totalSpaces: number;
  assessedSpaces: number;
  avgScore: number;
  campusDistribution: {
    [campusName: string]: {
      spaces: number;
      score: number;
    };
  };
  keyMetrics: {
    [metricName: string]: number;
  };
  recentAssessments: number;
  priorityItems: number;
}

export interface OverviewData {
  totalSpaces: number;
  assessedSpaces: number;
  avgAssessmentScore: number;
  priorityActions: number;
  completionRate: number;
  campuses: string[];
}

export interface PrioritizationMatrix {
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  criticalNeeds: {
    area: string;
    campus: string;
    score: number;
    urgency: string;
  }[];
}

// Filter Types
export interface AssessmentFilters {
  campus?: string;
  college?: string;
  department?: string;
  priority?: string;
  category?: string;
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  scoreRange?: {
    min: number;
    max: number;
  };
}

// Export all types for easy importing
export type {
  AssessmentCriteria,
  ClassroomAssessment,
  AdminOfficeAssessment,
  PrioritizationItem,
  CampusData,
  CollegeData,
  DepartmentData,
  AssessmentCategory,
  OverviewData,
  PrioritizationMatrix,
  AssessmentFilters
};