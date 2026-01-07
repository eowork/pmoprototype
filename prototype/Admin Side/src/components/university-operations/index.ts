// University Operations module exports
export { HigherEducationProgramPage } from './HigherEducationProgramPage';
export { ResearchProgramPage } from './ResearchProgramPage';
export { TechnicalAdvisoryExtensionProgramPage } from './TechnicalAdvisoryExtensionProgramPage';
export type { 
  OutcomeIndicator, 
  QuarterlyData, 
  HigherEducationMetrics 
} from './types/QuarterlyAssessment';
export { 
  OUTCOME_INDICATORS, 
  QUARTERS, 
  calculateTotal, 
  calculateVariance, 
  getVariancePercentage 
} from './types/QuarterlyAssessment';
export { 
  generateQuarterlyAssessmentData, 
  validateQuarterlyData, 
  formatPercentage, 
  formatVariance, 
  getVarianceColor, 
  getQuarterLabel 
} from './utils/quarterlyAssessmentData';