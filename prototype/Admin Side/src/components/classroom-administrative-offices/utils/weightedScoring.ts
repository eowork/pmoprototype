// Weighted Scoring System for Laboratory Assessment
// Category weights (must total 100%)
export const CATEGORY_WEIGHTS = {
  accessibility: 5,
  functionality: 5,
  utility: 10,
  sanitation: 10,
  instructionalTools: 10,
  laboratoryEquipment: 20,
  furnitureFixtures: 10,
  space: 10,
  disasterPreparedness: 10,
  inclusivity: 5
};

export interface CategoryScore {
  name: string;
  totalRating: number;
  maxPossibleScore: number;
  categoryScore: number; // Percentage (0-100)
  weight: number; // Percentage
  weightedScore: number; // Category score × weight
}

/**
 * Calculate total rating sum for a category
 */
function calculateTotalRating(categoryData: any): number {
  if (typeof categoryData === 'object' && categoryData !== null) {
    return Object.values(categoryData).reduce((sum: number, value: any) => {
      if (typeof value === 'number') {
        return sum + value;
      } else if (typeof value === 'object' && value !== null && 'rating' in value) {
        return sum + (value.rating || 0);
      }
      return sum;
    }, 0);
  }
  return 0;
}

/**
 * Calculate maximum possible score for a category
 */
function calculateMaxPossibleScore(categoryData: any): number {
  if (typeof categoryData === 'object' && categoryData !== null) {
    return Object.values(categoryData).reduce((count: number, value: any) => {
      if (typeof value === 'number' || (typeof value === 'object' && value !== null && 'rating' in value)) {
        return count + 5; // Maximum rating is 5
      }
      return count;
    }, 0);
  }
  return 0;
}

/**
 * Calculate category score as percentage
 */
function calculateCategoryScore(totalRating: number, maxPossibleScore: number): number {
  if (maxPossibleScore === 0) return 0;
  return (totalRating / maxPossibleScore) * 100;
}

/**
 * Calculate weighted score
 */
function calculateWeightedScore(categoryScore: number, weight: number): number {
  return (categoryScore * weight) / 100;
}

/**
 * Calculate all category scores and weighted scores
 */
export function calculateAllCategoryScores(formData: any): CategoryScore[] {
  const categories: CategoryScore[] = [];

  // 1. Accessibility (5%)
  const accessibilityRating = calculateTotalRating(formData.accessibility);
  const accessibilityMax = calculateMaxPossibleScore(formData.accessibility);
  const accessibilityScore = calculateCategoryScore(accessibilityRating, accessibilityMax);
  categories.push({
    name: 'Accessibility',
    totalRating: accessibilityRating,
    maxPossibleScore: accessibilityMax,
    categoryScore: accessibilityScore,
    weight: CATEGORY_WEIGHTS.accessibility,
    weightedScore: calculateWeightedScore(accessibilityScore, CATEGORY_WEIGHTS.accessibility)
  });

  // 2. Functionality (5%)
  const functionalityRating = calculateTotalRating(formData.functionality);
  const functionalityMax = calculateMaxPossibleScore(formData.functionality);
  const functionalityScore = calculateCategoryScore(functionalityRating, functionalityMax);
  categories.push({
    name: 'Functionality',
    totalRating: functionalityRating,
    maxPossibleScore: functionalityMax,
    categoryScore: functionalityScore,
    weight: CATEGORY_WEIGHTS.functionality,
    weightedScore: calculateWeightedScore(functionalityScore, CATEGORY_WEIGHTS.functionality)
  });

  // 3. Utility (10%)
  const utilityRating = calculateTotalRating(formData.utility);
  const utilityMax = calculateMaxPossibleScore(formData.utility);
  const utilityScore = calculateCategoryScore(utilityRating, utilityMax);
  categories.push({
    name: 'Utility',
    totalRating: utilityRating,
    maxPossibleScore: utilityMax,
    categoryScore: utilityScore,
    weight: CATEGORY_WEIGHTS.utility,
    weightedScore: calculateWeightedScore(utilityScore, CATEGORY_WEIGHTS.utility)
  });

  // 4. Sanitation (10%)
  const sanitationRating = calculateTotalRating(formData.sanitation);
  const sanitationMax = calculateMaxPossibleScore(formData.sanitation);
  const sanitationScore = calculateCategoryScore(sanitationRating, sanitationMax);
  categories.push({
    name: 'Sanitation',
    totalRating: sanitationRating,
    maxPossibleScore: sanitationMax,
    categoryScore: sanitationScore,
    weight: CATEGORY_WEIGHTS.sanitation,
    weightedScore: calculateWeightedScore(sanitationScore, CATEGORY_WEIGHTS.sanitation)
  });

  // 5. Instructional Tools (10%)
  const instructionalRating = calculateTotalRating(formData.instructionalTools);
  const instructionalMax = calculateMaxPossibleScore(formData.instructionalTools);
  const instructionalScore = calculateCategoryScore(instructionalRating, instructionalMax);
  categories.push({
    name: 'Instructional Tools',
    totalRating: instructionalRating,
    maxPossibleScore: instructionalMax,
    categoryScore: instructionalScore,
    weight: CATEGORY_WEIGHTS.instructionalTools,
    weightedScore: calculateWeightedScore(instructionalScore, CATEGORY_WEIGHTS.instructionalTools)
  });

  // 6. Laboratory Equipment & Safety (20%)
  const labEquipmentRating = calculateTotalRating(formData.laboratoryEquipment);
  const labEquipmentMax = calculateMaxPossibleScore(formData.laboratoryEquipment);
  const labEquipmentScore = calculateCategoryScore(labEquipmentRating, labEquipmentMax);
  categories.push({
    name: 'Laboratory Equipment & Safety',
    totalRating: labEquipmentRating,
    maxPossibleScore: labEquipmentMax,
    categoryScore: labEquipmentScore,
    weight: CATEGORY_WEIGHTS.laboratoryEquipment,
    weightedScore: calculateWeightedScore(labEquipmentScore, CATEGORY_WEIGHTS.laboratoryEquipment)
  });

  // 7. Furniture and Fixtures (10%)
  const furnitureRating = calculateTotalRating(formData.furnitureFixtures);
  const furnitureMax = calculateMaxPossibleScore(formData.furnitureFixtures);
  const furnitureScore = calculateCategoryScore(furnitureRating, furnitureMax);
  categories.push({
    name: 'Furniture and Fixtures',
    totalRating: furnitureRating,
    maxPossibleScore: furnitureMax,
    categoryScore: furnitureScore,
    weight: CATEGORY_WEIGHTS.furnitureFixtures,
    weightedScore: calculateWeightedScore(furnitureScore, CATEGORY_WEIGHTS.furnitureFixtures)
  });

  // 8. Space (10%)
  const spaceRating = calculateTotalRating(formData.space);
  const spaceMax = calculateMaxPossibleScore(formData.space);
  const spaceScore = calculateCategoryScore(spaceRating, spaceMax);
  categories.push({
    name: 'Space',
    totalRating: spaceRating,
    maxPossibleScore: spaceMax,
    categoryScore: spaceScore,
    weight: CATEGORY_WEIGHTS.space,
    weightedScore: calculateWeightedScore(spaceScore, CATEGORY_WEIGHTS.space)
  });

  // 9. Disaster Preparedness and Security (10%)
  const disasterRating = calculateTotalRating(formData.disasterPreparedness);
  const disasterMax = calculateMaxPossibleScore(formData.disasterPreparedness);
  const disasterScore = calculateCategoryScore(disasterRating, disasterMax);
  categories.push({
    name: 'Disaster Preparedness & Security',
    totalRating: disasterRating,
    maxPossibleScore: disasterMax,
    categoryScore: disasterScore,
    weight: CATEGORY_WEIGHTS.disasterPreparedness,
    weightedScore: calculateWeightedScore(disasterScore, CATEGORY_WEIGHTS.disasterPreparedness)
  });

  // 10. Inclusivity (5%)
  const inclusivityRating = calculateTotalRating(formData.inclusivity);
  const inclusivityMax = calculateMaxPossibleScore(formData.inclusivity);
  const inclusivityScore = calculateCategoryScore(inclusivityRating, inclusivityMax);
  categories.push({
    name: 'Inclusivity',
    totalRating: inclusivityRating,
    maxPossibleScore: inclusivityMax,
    categoryScore: inclusivityScore,
    weight: CATEGORY_WEIGHTS.inclusivity,
    weightedScore: calculateWeightedScore(inclusivityScore, CATEGORY_WEIGHTS.inclusivity)
  });

  return categories;
}

/**
 * Calculate overall weighted score
 */
export function calculateOverallWeightedScore(categoryScores: CategoryScore[]): number {
  return categoryScores.reduce((total, category) => total + category.weightedScore, 0);
}

/**
 * Get rating interpretation based on overall weighted score
 */
export function getRatingInterpretation(overallWeightedScore: number): string {
  if (overallWeightedScore >= 90) return 'Excellent';
  if (overallWeightedScore >= 75) return 'Good';
  if (overallWeightedScore >= 60) return 'Needs Improvement';
  return 'Unsatisfactory';
}

/**
 * Get overall condition based on weighted score
 */
export function getOverallCondition(overallWeightedScore: number): string {
  if (overallWeightedScore >= 90) return 'Excellent';
  if (overallWeightedScore >= 75) return 'Good';
  if (overallWeightedScore >= 60) return 'Fair';
  return 'Poor';
}
