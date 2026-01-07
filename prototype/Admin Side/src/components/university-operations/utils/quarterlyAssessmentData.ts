import { OutcomeIndicator, FIXED_OUTCOME_INDICATORS, calculateAverage, calculateVariance, YearlyAssessment, OrganizationalInfo } from '../types/QuarterlyAssessment';

// Generate default organizational information
export const generateDefaultOrganizationalInfo = (): OrganizationalInfo => ({
  department: 'Higher Education Office',
  agencyEntity: 'Caraga State University',
  operatingUnit: 'Project Management Unit',
  organizationCode: 'CSU-PMU-HEP-2024',
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'System'
});

// Generate assessment data for the Higher Education Program
export const generateAssessmentDataByYear = (year: number): OutcomeIndicator[] => {
  const indicators = Object.values(FIXED_OUTCOME_INDICATORS);
  const currentYear = new Date().getFullYear();
  
  return indicators.map((indicator, index) => {
    // Different base targets for each indicator
    const baseTargets = [85, 78, 92, 88];
    const baseTarget = baseTargets[index];
    
    // Slight improvement each year
    const yearOffset = (year - 2024) * 1.2;
    const target = Math.min(100, Math.max(0, baseTarget + yearOffset));
    
    // Generate quarterly data with realistic patterns
    const targetQuarters = {
      quarter1: target,
      quarter2: target, 
      quarter3: target,
      quarter4: target
    };
    
    // Generate sample accomplishment scores (numerator/denominator format)
    const sampleScores = [
      ['412/485', '428/485', '441/485', '456/485'], // Bachelor degree graduates
      ['89/115', '94/115', '97/115', '102/115'], // Technical vocational graduates
      ['287/312', '295/312', '301/312', '308/312'], // NCIII assessment takers
      ['251/287', '259/287', '267/287', '275/287'] // NCIII certified students
    ];
    
    const accomplishmentScores = {
      quarter1: sampleScores[index][0],
      quarter2: sampleScores[index][1],
      quarter3: sampleScores[index][2],
      quarter4: sampleScores[index][3]
    };
    
    // Generate accomplishment data with realistic variations and null handling
    let accomplishmentQuarters;
    
    if (year > currentYear) {
      // Future years have no data
      accomplishmentQuarters = {
        quarter1: null,
        quarter2: null,
        quarter3: null,
        quarter4: null
      };
    } else if (year === currentYear) {
      // Current year has data up to Q3, Q4 is null
      const variations = [
        [2.5, 1.8, 3.2], // Bachelor graduates
        [3.1, 2.4, 4.1], // Technical vocational
        [1.8, 2.6, 3.5], // NCIII assessment
        [2.2, 1.9, 2.8]  // NCIII certification
      ];
      
      const variation = variations[index];
      accomplishmentQuarters = {
        quarter1: Math.max(0, Math.min(100, target + variation[0])),
        quarter2: Math.max(0, Math.min(100, target + variation[1])),
        quarter3: Math.max(0, Math.min(100, target + variation[2])),
        quarter4: null // Current year Q4 not available yet
      };
    } else {
      // Past years have complete data
      const variations = [
        [2.2, 1.5, 2.8, 3.1], // Bachelor graduates
        [2.8, 2.1, 3.6, 3.3], // Technical vocational
        [1.5, 2.2, 3.1, 2.9], // NCIII assessment
        [1.9, 1.6, 2.5, 2.3]  // NCIII certification
      ];
      
      const variation = variations[index];
      accomplishmentQuarters = {
        quarter1: Math.max(0, Math.min(100, target + variation[0])),
        quarter2: Math.max(0, Math.min(100, target + variation[1])),
        quarter3: Math.max(0, Math.min(100, target + variation[2])),
        quarter4: Math.max(0, Math.min(100, target + variation[3]))
      };
    }
    
    const avgTarget = calculateAverage(targetQuarters);
    const avgAccomplishment = calculateAverage(accomplishmentQuarters);
    const variance = calculateVariance(avgTarget, avgAccomplishment);
    
    const remarks = [
      'Bachelor degree program completion rates have shown steady improvement through enhanced academic support services, improved faculty-student ratio, and streamlined degree completion pathways.',
      'Technical vocational program outcomes reflect strong industry partnerships and practical skills development. Graduates demonstrate high competency levels in their respective technical fields.',
      'NCIII assessment participation rates have increased through improved student awareness programs and enhanced preparation support from technical instructors.',
      'NCIII certification success rates demonstrate the effectiveness of competency-based training programs and alignment with industry standards and requirements.'
    ];
    
    return {
      id: indicator.id,
      particular: indicator.particular,
      description: indicator.description,
      uacsCode: indicator.uacsCode,
      physicalTarget: targetQuarters,
      physicalAccomplishment: accomplishmentQuarters,
      accomplishmentScore: accomplishmentScores,
      varianceAsOf: new Date().toISOString().split('T')[0],
      variance,
      remarks: remarks[index],
      budgetYear: year,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'System'
    };
  });
};

// Generate data for multiple years
export const generateMultiYearAssessmentData = (): YearlyAssessment[] => {
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
  
  return years.map(year => ({
    year,
    indicators: generateAssessmentDataByYear(year),
    organizationalInfo: generateDefaultOrganizationalInfo(),
    createdAt: new Date(),
    updatedAt: new Date()
  }));
};

export const validateQuarterlyData = (data: Partial<OutcomeIndicator>): string[] => {
  const errors: string[] = [];
  
  if (!data.uacsCode?.trim()) {
    errors.push('UACS Code is required');
  }
  
  if (!data.physicalTarget) {
    errors.push('Physical Target data is required');
  } else {
    ['quarter1', 'quarter2', 'quarter3', 'quarter4'].forEach(quarter => {
      const value = data.physicalTarget[quarter as keyof typeof data.physicalTarget];
      if (value !== null && (typeof value !== 'number' || value < 0 || value > 100)) {
        errors.push(`Invalid ${quarter} target value (must be 0-100% or null)`);
      }
    });
  }
  
  if (!data.physicalAccomplishment) {
    errors.push('Physical Accomplishment data is required');
  } else {
    ['quarter1', 'quarter2', 'quarter3', 'quarter4'].forEach(quarter => {
      const value = data.physicalAccomplishment[quarter as keyof typeof data.physicalAccomplishment];
      if (value !== null && (typeof value !== 'number' || value < 0 || value > 100)) {
        errors.push(`Invalid ${quarter} accomplishment value (must be 0-100% or null)`);
      }
    });
  }
  
  return errors;
};

export const validateOrganizationalInfo = (data: Partial<OrganizationalInfo>): string[] => {
  const errors: string[] = [];
  
  if (!data.department?.trim()) {
    errors.push('Department is required');
  }
  
  if (!data.agencyEntity?.trim()) {
    errors.push('Agency/Entity is required');
  }
  
  if (!data.operatingUnit?.trim()) {
    errors.push('Operating Unit is required');
  }
  
  if (!data.organizationCode?.trim()) {
    errors.push('Organization Code is required');
  }
  
  return errors;
};

export const getAvailableYears = (): number[] => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 7 }, (_, i) => currentYear - 3 + i); // 3 years back, current, 3 years forward
};

export const getQuarterLabel = (quarter: string): string => {
  const quarterMap = {
    quarter1: '1st Quarter',
    quarter2: '2nd Quarter', 
    quarter3: '3rd Quarter',
    quarter4: '4th Quarter'
  };
  return quarterMap[quarter as keyof typeof quarterMap] || quarter;
};

// Create chart data for specific indicator with view filtering
export const createIndicatorChartData = (indicator: OutcomeIndicator, view: 'all' | 'target' | 'accomplishment' | 'variance' = 'all') => {
  const baseData = [
    {
      quarter: 'Q1',
      target: indicator.physicalTarget.quarter1,
      actual: indicator.physicalAccomplishment.quarter1,
      variance: indicator.physicalAccomplishment.quarter1 !== null && indicator.physicalTarget.quarter1 !== null
        ? indicator.physicalAccomplishment.quarter1 - indicator.physicalTarget.quarter1 : null
    },
    {
      quarter: 'Q2', 
      target: indicator.physicalTarget.quarter2,
      actual: indicator.physicalAccomplishment.quarter2,
      variance: indicator.physicalAccomplishment.quarter2 !== null && indicator.physicalTarget.quarter2 !== null
        ? indicator.physicalAccomplishment.quarter2 - indicator.physicalTarget.quarter2 : null
    },
    {
      quarter: 'Q3',
      target: indicator.physicalTarget.quarter3,
      actual: indicator.physicalAccomplishment.quarter3,
      variance: indicator.physicalAccomplishment.quarter3 !== null && indicator.physicalTarget.quarter3 !== null
        ? indicator.physicalAccomplishment.quarter3 - indicator.physicalTarget.quarter3 : null
    },
    {
      quarter: 'Q4',
      target: indicator.physicalTarget.quarter4,
      actual: indicator.physicalAccomplishment.quarter4,
      variance: indicator.physicalAccomplishment.quarter4 !== null && indicator.physicalTarget.quarter4 !== null
        ? indicator.physicalAccomplishment.quarter4 - indicator.physicalTarget.quarter4 : null
    }
  ];

  // Filter data based on view
  switch (view) {
    case 'target':
      return baseData.map(item => ({ ...item, actual: null, variance: null }));
    case 'accomplishment':
      return baseData.map(item => ({ ...item, target: null, variance: null }));
    case 'variance':
      return baseData.map(item => ({ ...item, target: null, actual: null }));
    default:
      return baseData;
  }
};

// Helper to get the most recent quarter with data
export const getLatestQuarterData = (indicator: OutcomeIndicator) => {
  const quarters = ['quarter4', 'quarter3', 'quarter2', 'quarter1'] as const;
  
  for (const quarter of quarters) {
    const actual = indicator.physicalAccomplishment[quarter];
    const target = indicator.physicalTarget[quarter];
    
    if (actual !== null && actual !== undefined && actual > 0) {
      return {
        quarter,
        actual,
        target,
        variance: actual - (target || 0)
      };
    }
  }
  
  return null;
};