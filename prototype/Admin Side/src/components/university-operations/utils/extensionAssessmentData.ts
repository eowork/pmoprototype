import { ExtensionAssessment, FIXED_EXTENSION_INDICATORS, OrganizationalInfo } from '../types/ExtensionAssessment';

// Generate realistic extension assessment data
export const generateExtensionAssessmentDataByYear = (year: number): ExtensionAssessment[] => {
  return Object.values(FIXED_EXTENSION_INDICATORS).map((indicator, index) => {
    // Generate realistic quarterly targets and accomplishments
    const baseTarget = 20 + (index * 8) + Math.random() * 15;
    const variance = (Math.random() - 0.5) * 20;
    
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

    // Extension-specific metrics
    const beneficiaries = Math.floor(Math.random() * 500) + 100;
    const communityProjects = Math.floor(Math.random() * 20) + 5;
    const trainingsProvided = Math.floor(Math.random() * 30) + 10;
    const practitioners = Math.floor(Math.random() * 50) + 15;
    const impactScore = Math.floor(Math.random() * 40) + 60; // 60-100 range

    const extensionAreas = [
      'Agricultural Development',
      'Community Health',
      'Environmental Conservation',
      'Livelihood Programs',
      'Educational Support',
      'Technology Transfer',
      'Cooperative Development',
      'Youth Development'
    ];

    const targetSectors = [
      'Farmers and Agricultural Workers',
      'Fisherfolk and Coastal Communities',
      'Women and Children',
      'Indigenous Communities',
      'Urban Poor',
      'Small Business Owners',
      'Students and Out-of-School Youth',
      'Senior Citizens'
    ];

    return {
      id: `${year}_ext_${indicator.id}`,
      particular: indicator.particular,
      uacsCode: `EXT-${String(index + 1).padStart(3, '0')}-${year}`,
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
      remarks: generateExtensionRemarks(variance, indicator.particular),
      beneficiaries,
      communityProjects,
      trainingsProvided,
      practitioners,
      impactScore,
      communityPartners: `${Math.floor(Math.random() * 15) + 5} partner organizations`,
      extensionArea: extensionAreas[Math.floor(Math.random() * extensionAreas.length)],
      targetSector: targetSectors[Math.floor(Math.random() * targetSectors.length)],
      createdAt: new Date(`${year}-01-01`),
      updatedAt: new Date(),
      createdBy: 'Extension Office',
      updatedBy: 'Program Coordinator'
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
const generateExtensionRemarks = (variance: number, particular: string): string => {
  const positiveRemarks = [
    'Exceeded community engagement targets through innovative outreach strategies',
    'Strong community participation and positive feedback received',
    'Successful partnerships with local government units and NGOs',
    'High impact achieved through collaborative community programs',
    'Effective technology transfer and knowledge sharing activities'
  ];

  const neutralRemarks = [
    'Program implementation proceeding as planned',
    'Regular monitoring and evaluation activities conducted',
    'Community feedback being incorporated for program improvement',
    'Steady progress in achieving extension service objectives',
    'Continuous capacity building for program sustainability'
  ];

  const negativeRemarks = [
    'Challenges in community mobilization due to external factors',
    'Weather-related disruptions affected program implementation',
    'Need for enhanced community awareness and participation',
    'Resource constraints limiting program expansion',
    'Adjustments needed to better align with community needs'
  ];

  if (variance > 5) {
    return positiveRemarks[Math.floor(Math.random() * positiveRemarks.length)];
  } else if (variance < -5) {
    return negativeRemarks[Math.floor(Math.random() * negativeRemarks.length)];
  } else {
    return neutralRemarks[Math.floor(Math.random() * neutralRemarks.length)];
  }
};

// Generate default organizational information
export const generateDefaultOrganizationalInfo = (): OrganizationalInfo => ({
  department: 'Community Extension Office',
  agencyEntity: 'Caraga State University',
  operatingUnit: 'Extension and Community Services',
  organizationCode: 'CSU-EXT-2024',
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

// Extension-specific helper functions
export const calculateCommunityImpact = (assessments: ExtensionAssessment[]): {
  totalBeneficiaries: number;
  totalProjects: number;
  averageImpactScore: number;
  topExtensionAreas: string[];
} => {
  const totalBeneficiaries = assessments.reduce((sum, assessment) => 
    sum + (assessment.beneficiaries || 0), 0);
  
  const totalProjects = assessments.reduce((sum, assessment) => 
    sum + (assessment.communityProjects || 0), 0);
  
  const averageImpactScore = assessments.length > 0 
    ? assessments.reduce((sum, assessment) => sum + (assessment.impactScore || 0), 0) / assessments.length 
    : 0;

  // Count extension areas frequency
  const areaCount: Record<string, number> = {};
  assessments.forEach(assessment => {
    if (assessment.extensionArea) {
      areaCount[assessment.extensionArea] = (areaCount[assessment.extensionArea] || 0) + 1;
    }
  });

  const topExtensionAreas = Object.entries(areaCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([area]) => area);

  return {
    totalBeneficiaries,
    totalProjects,
    averageImpactScore,
    topExtensionAreas
  };
};