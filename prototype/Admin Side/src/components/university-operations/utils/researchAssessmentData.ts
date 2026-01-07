import { ResearchAssessment, FIXED_RESEARCH_INDICATORS, OrganizationalInfo } from '../types/ResearchAssessment';

// Generate realistic research assessment data
export const generateResearchAssessmentDataByYear = (year: number): ResearchAssessment[] => {
  return Object.values(FIXED_RESEARCH_INDICATORS).map((indicator, index) => {
    // Generate realistic quarterly targets and accomplishments
    const baseTarget = 15 + (index * 5) + Math.random() * 10;
    const variance = (Math.random() - 0.5) * 15;
    
    const target = {
      quarter1: Math.round(baseTarget * 0.2),
      quarter2: Math.round(baseTarget * 0.3),
      quarter3: Math.round(baseTarget * 0.3),
      quarter4: Math.round(baseTarget * 0.2)
    };

    const accomplishment = {
      quarter1: Math.max(0, Math.round((target.quarter1 || 0) + variance * 0.25)),
      quarter2: Math.max(0, Math.round((target.quarter2 || 0) + variance * 0.25)),
      quarter3: Math.max(0, Math.round((target.quarter3 || 0) + variance * 0.25)),
      quarter4: Math.max(0, Math.round((target.quarter4 || 0) + variance * 0.25))
    };

    // Research-specific metrics
    const researchOutput = Math.floor(Math.random() * 30) + 70; // 70-100 range
    const publications = Math.floor(Math.random() * 15) + 5;
    const patents = Math.floor(Math.random() * 5) + 1;
    const citations = Math.floor(Math.random() * 100) + 20;

    const researchAreas = [
      'Agricultural Sciences',
      'Engineering and Technology',
      'Natural Sciences',
      'Health Sciences',
      'Social Sciences',
      'Environmental Sciences',
      'Information Technology',
      'Marine Sciences'
    ];

    const fundingSources = [
      'Department of Science and Technology (DOST)',
      'Commission on Higher Education (CHED)',
      'Philippine Council for Agriculture and Fisheries (PCAF)',
      'International Research Collaborations',
      'Industry Partners',
      'University Research Fund',
      'Regional Development Council',
      'Private Foundation Grants'
    ];

    return {
      id: `${year}_res_${indicator.id}`,
      particular: indicator.particular,
      uacsCode: `RES-${String(index + 1).padStart(3, '0')}-${year}`,
      physicalTarget: target,
      physicalAccomplishment: accomplishment,
      accomplishmentScore: {
        quarter1: getScoreRating(accomplishment.quarter1, target.quarter1),
        quarter2: getScoreRating(accomplishment.quarter2, target.quarter2),
        quarter3: getScoreRating(accomplishment.quarter3, target.quarter3),
        quarter4: getScoreRating(accomplishment.quarter4, target.quarter4)
      },
      varianceAsOf: `Q4 ${year}`,
      variance: Math.round(variance),
      remarks: generateResearchRemarks(variance, indicator.particular),
      researchOutput,
      publications,
      patents,
      citations,
      collaborations: `${Math.floor(Math.random() * 10) + 3} active collaborations`,
      fundingSource: fundingSources[Math.floor(Math.random() * fundingSources.length)],
      researchArea: researchAreas[Math.floor(Math.random() * researchAreas.length)],
      createdAt: new Date(`${year}-01-01`),
      updatedAt: new Date(),
      createdBy: 'Research Office',
      updatedBy: 'Research Coordinator'
    };
  });
};

// Helper function to generate score ratings
const getScoreRating = (actual: number | null, target: number | null): string => {
  if (!actual || !target) return 'N/A';
  
  const percentage = (actual / target) * 100;
  
  if (percentage >= 95) return 'Excellent';
  if (percentage >= 85) return 'Very Good';
  if (percentage >= 75) return 'Good';
  if (percentage >= 60) return 'Satisfactory';
  return 'Needs Improvement';
};

// Helper function to generate contextual remarks
const generateResearchRemarks = (variance: number, particular: string): string => {
  const positiveRemarks = [
    'Exceeded research targets through innovative methodologies and collaborations',
    'Strong publication output with high-impact journal submissions',
    'Successful grant acquisition and funding diversification',
    'Enhanced research capacity through faculty development programs',
    'Outstanding research collaboration with international partners'
  ];

  const neutralRemarks = [
    'Research activities proceeding according to planned timeline',
    'Regular progress monitoring and evaluation conducted',
    'Continuous improvement in research quality and output',
    'Steady advancement in research capability building',
    'Ongoing efforts to enhance research infrastructure'
  ];

  const negativeRemarks = [
    'Challenges in research implementation due to equipment limitations',
    'Delays in research completion due to external factors',
    'Need for enhanced research support and infrastructure',
    'Resource constraints affecting research productivity',
    'Requirement for additional training and capacity building'
  ];

  if (variance > 3) {
    return positiveRemarks[Math.floor(Math.random() * positiveRemarks.length)];
  } else if (variance < -3) {
    return negativeRemarks[Math.floor(Math.random() * negativeRemarks.length)];
  } else {
    return neutralRemarks[Math.floor(Math.random() * neutralRemarks.length)];
  }
};

// Generate default organizational information
export const generateDefaultOrganizationalInfo = (): OrganizationalInfo => ({
  department: 'Research and Development Office',
  agencyEntity: 'Caraga State University',
  operatingUnit: 'Academic Research and Innovation',
  organizationCode: 'CSU-RDO-2024',
  createdAt: new Date(),
  updatedAt: new Date()
});

// Validation functions
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

// Get available years for selection
export const getAvailableYears = (): number[] => {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  
  for (let i = currentYear - 5; i <= currentYear + 2; i++) {
    years.push(i);
  }
  
  return years;
};

// Research-specific helper functions
export const calculateResearchMetrics = (assessments: ResearchAssessment[]): {
  totalPublications: number;
  totalPatents: number;
  totalCitations: number;
  averageResearchOutput: number;
  topResearchAreas: string[];
  topFundingSources: string[];
} => {
  const totalPublications = assessments.reduce((sum, assessment) => 
    sum + (assessment.publications || 0), 0);
  
  const totalPatents = assessments.reduce((sum, assessment) => 
    sum + (assessment.patents || 0), 0);
  
  const totalCitations = assessments.reduce((sum, assessment) => 
    sum + (assessment.citations || 0), 0);
  
  const averageResearchOutput = assessments.length > 0 
    ? assessments.reduce((sum, assessment) => sum + (assessment.researchOutput || 0), 0) / assessments.length 
    : 0;

  // Count research areas frequency
  const areaCount: Record<string, number> = {};
  assessments.forEach(assessment => {
    if (assessment.researchArea) {
      areaCount[assessment.researchArea] = (areaCount[assessment.researchArea] || 0) + 1;
    }
  });

  const topResearchAreas = Object.entries(areaCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([area]) => area);

  // Count funding sources frequency
  const fundingCount: Record<string, number> = {};
  assessments.forEach(assessment => {
    if (assessment.fundingSource) {
      fundingCount[assessment.fundingSource] = (fundingCount[assessment.fundingSource] || 0) + 1;
    }
  });

  const topFundingSources = Object.entries(fundingCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([source]) => source);

  return {
    totalPublications,
    totalPatents,
    totalCitations,
    averageResearchOutput,
    topResearchAreas,
    topFundingSources
  };
};