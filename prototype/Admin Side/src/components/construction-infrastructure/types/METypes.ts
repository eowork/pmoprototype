export interface MEDailyLog {
  id: string;
  projectId: string;
  date: string;
  physicalProgress: number; // percentage
  financialProgress: number; // percentage
  accomplishments: string[];
  issues: string[];
  weather: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  laborCount: number;
  equipmentStatus: 'operational' | 'partial' | 'down';
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MEWeeklyRollup {
  id: string;
  projectId: string;
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  avgPhysicalProgress: number;
  avgFinancialProgress: number;
  totalAccomplishments: number;
  totalIssues: number;
  avgLaborCount: number;
  operationalDays: number;
  weatherSummary: {
    sunny: number;
    cloudy: number;
    rainy: number;
    stormy: number;
  };
  variance: number;
  kpis: {
    onTimePerformance: number;
    budgetEfficiency: number;
    qualityScore: number;
    productivityIndex: number;
  };
  dailyLogIds: string[];
  generatedAt: string;
}

export interface MEMonthlyRollup {
  id: string;
  projectId: string;
  month: number;
  year: number;
  startDate: string;
  endDate: string;
  avgPhysicalProgress: number;
  avgFinancialProgress: number;
  totalAccomplishments: number;
  totalIssues: number;
  avgLaborCount: number;
  operationalDays: number;
  weatherSummary: {
    sunny: number;
    cloudy: number;
    rainy: number;
    stormy: number;
  };
  variance: number;
  kpis: {
    onTimePerformance: number;
    budgetEfficiency: number;
    qualityScore: number;
    productivityIndex: number;
    resourceUtilization: number;
  };
  weeklyRollupIds: string[];
  milestones: {
    achieved: number;
    missed: number;
    upcoming: number;
  };
  generatedAt: string;
}

export interface MEQuarterlyRollup {
  id: string;
  projectId: string;
  quarter: number; // 1, 2, 3, 4
  year: number;
  startDate: string;
  endDate: string;
  avgPhysicalProgress: number;
  avgFinancialProgress: number;
  totalAccomplishments: number;
  totalIssues: number;
  avgLaborCount: number;
  operationalDays: number;
  weatherSummary: {
    sunny: number;
    cloudy: number;
    rainy: number;
    stormy: number;
  };
  variance: number;
  kpis: {
    onTimePerformance: number;
    budgetEfficiency: number;
    qualityScore: number;
    productivityIndex: number;
    resourceUtilization: number;
    overallProjectHealth: number;
  };
  monthlyRollupIds: string[];
  milestones: {
    achieved: number;
    missed: number;
    upcoming: number;
  };
  budgetAnalysis: {
    allocatedBudget: number;
    utilizedBudget: number;
    remainingBudget: number;
    burnRate: number;
  };
  riskAssessment: {
    lowRisk: number;
    mediumRisk: number;
    highRisk: number;
    criticalRisk: number;
  };
  generatedAt: string;
}

// Legacy interface for backward compatibility
export interface MERollup {
  id: string;
  projectId: string;
  period: 'weekly' | 'monthly' | 'quarterly';
  startDate: string;
  endDate: string;
  avgPhysicalProgress: number;
  avgFinancialProgress: number;
  totalAccomplishments: number;
  totalIssues: number;
  variance: number; // difference between planned and actual
  kpis: {
    onTimePerformance: number;
    budgetEfficiency: number;
    qualityScore: number;
  };
  generatedAt: string;
}

export interface MELogEntry {
  date: string;
  physicalProgress: number;
  financialProgress: number;
  accomplishments: string;
  issues: string;
  weather: string;
  laborCount: number;
  equipmentStatus: string;
  notes?: string;
}

export interface ProgressVariance {
  period: string;
  plannedProgress: number;
  actualProgress: number;
  variance: number;
  status: 'on-track' | 'behind' | 'ahead';
}

export interface MEMetrics {
  totalLogs: number;
  avgDailyProgress: number;
  currentVariance: number;
  lastUpdated: string;
  trendDirection: 'up' | 'down' | 'stable';
}

// New global filter types
export type MEFilterPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export interface MEFilter {
  period: MEFilterPeriod;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  specificPeriod?: {
    year: number;
    quarter?: number; // 1-4 for quarterly
    month?: number; // 1-12 for monthly
    week?: number; // 1-53 for weekly
  };
}

export interface MEAggregatedData {
  period: MEFilterPeriod;
  data: MEDailyLog[] | MEWeeklyRollup[] | MEMonthlyRollup[] | MEQuarterlyRollup[];
  summary: {
    totalEntries: number;
    avgPhysicalProgress: number;
    avgFinancialProgress: number;
    totalAccomplishments: number;
    totalIssues: number;
    overallVariance: number;
    periodLabel: string;
  };
}

// Rollup calculation interfaces
export interface RollupCalculationRules {
  daily: {
    sourceData: MEDailyLog[];
    aggregationFields: string[];
    averageFields: string[];
    sumFields: string[];
  };
  weekly: {
    sourceData: MEDailyLog[];
    groupBy: 'week';
    calculations: {
      avgPhysicalProgress: 'average';
      avgFinancialProgress: 'average';
      totalAccomplishments: 'sum';
      totalIssues: 'sum';
      avgLaborCount: 'average';
      operationalDays: 'count';
      variance: 'calculated';
    };
  };
  monthly: {
    sourceData: MEWeeklyRollup[];
    groupBy: 'month';
    calculations: {
      avgPhysicalProgress: 'average';
      avgFinancialProgress: 'average';
      totalAccomplishments: 'sum';
      totalIssues: 'sum';
      avgLaborCount: 'average';
      operationalDays: 'sum';
      variance: 'calculated';
    };
  };
  quarterly: {
    sourceData: MEMonthlyRollup[];
    groupBy: 'quarter';
    calculations: {
      avgPhysicalProgress: 'average';
      avgFinancialProgress: 'average';
      totalAccomplishments: 'sum';
      totalIssues: 'sum';
      avgLaborCount: 'average';
      operationalDays: 'sum';
      variance: 'calculated';
    };
  };
}