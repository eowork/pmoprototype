/**
 * Classroom Assessment Weighted Scoring System
 * 
 * Priority-Based Category Weights (Total: 100%):
 * - Accessibility: 15%
 * - Functionality: 15%
 * - Space: 15%
 * - Utility: 10%
 * - Sanitation: 10%
 * - Equipment: 10%
 * - Furniture and Fixtures: 10%
 * - Disaster Preparedness: 10%
 * - Inclusivity: 5%
 */

export interface ClassroomAssessmentFormData {
  // Basic Information
  buildingName: string;
  roomNumber: string;
  subject: string;
  roomType: string;
  customRoomType?: string;
  college: string;
  campus: string;
  semester: string;
  academicYear: string;
  numberOfStudents: string;
  schedule: string;
  dateOfAssessment: string;
  assessor: string;
  position: string;

  // Assessment Categories with Remarks
  accessibility: {
    pwdFriendlyFacilities: { rating: number; remarks: string };
    roomAccessibility: { rating: number; remarks: string };
    directionalSignages: { rating: number; remarks: string };
    pathways: { rating: number; remarks: string };
  };
  functionality: {
    flexibility: { rating: number; remarks: string };
    ventilation: { rating: number; remarks: string };
    noiseLevel: { rating: number; remarks: string };
  };
  utility: {
    electricity: { rating: number; remarks: string };
    lighting: { rating: number; remarks: string };
    internetConnectivity: { rating: number; remarks: string };
  };
  sanitation: {
    cleanliness: { rating: number; remarks: string };
    wasteDisposal: { rating: number; remarks: string };
    odor: { rating: number; remarks: string };
    comfortRoomAccess: { rating: number; remarks: string };
  };
  equipment: {
    projectorTvMonitorSpeakersMic: { rating: number; remarks: string };
  };
  furnitureFixtures: {
    chairsDesks: { rating: number; remarks: string };
    neutralDesk: { rating: number; remarks: string };
    teachersTablePodium: { rating: number; remarks: string };
    whiteboardBlackboard: { rating: number; remarks: string };
  };
  space: {
    roomCapacity: { rating: number; remarks: string };
    layout: { rating: number; remarks: string };
    storage: { rating: number; remarks: string };
  };
  disasterPreparedness: {
    emergencyExitsFireSafety: { rating: number; remarks: string };
    earthquakePreparedness: { rating: number; remarks: string };
    floodSafety: { rating: number; remarks: string };
    safetySignages: { rating: number; remarks: string };
  };
  inclusivity: {
    privacyInComfortRooms: { rating: number; remarks: string };
    genderNeutralRestrooms: { rating: number; remarks: string };
    safeSpaces: { rating: number; remarks: string };
    classroomAssignmentSpecialNeeds: { rating: number; remarks: string };
  };

  // General Remarks
  remarks: string;
  recommendingActions: string;
}

export interface CategoryScore {
  name: string;
  totalRating: number;
  maxPossibleScore: number;
  categoryScore: number; // Percentage (0-100)
  weight: number; // Weight percentage (0-100)
  weightedScore: number; // Weighted contribution (0-100)
}

// Category Weights - Total must be 100%
export const CLASSROOM_CATEGORY_WEIGHTS = {
  accessibility: 15,
  functionality: 15,
  space: 15,
  utility: 10,
  sanitation: 10,
  equipment: 10,
  furnitureFixtures: 10,
  disasterPreparedness: 10,
  inclusivity: 5
};

/**
 * Calculate category score
 * Formula: (Sum of Ratings / Max Possible Score) × 100
 */
export function calculateCategoryScore(ratings: number[], maxRating: number = 5): number {
  const totalRating = ratings.reduce((sum, rating) => sum + rating, 0);
  const maxPossibleScore = ratings.length * maxRating;
  return maxPossibleScore > 0 ? (totalRating / maxPossibleScore) * 100 : 0;
}

/**
 * Calculate weighted score for a category
 * Formula: Category Score × (Weight / 100)
 */
export function calculateWeightedScore(categoryScore: number, weight: number): number {
  return (categoryScore * weight) / 100;
}

/**
 * Calculate all category scores with weighted values
 */
export function calculateAllCategoryScores(formData: ClassroomAssessmentFormData): CategoryScore[] {
  // Extract ratings from each category
  const accessibilityRatings = [
    formData.accessibility.pwdFriendlyFacilities.rating,
    formData.accessibility.roomAccessibility.rating,
    formData.accessibility.directionalSignages.rating,
    formData.accessibility.pathways.rating
  ];

  const functionalityRatings = [
    formData.functionality.flexibility.rating,
    formData.functionality.ventilation.rating,
    formData.functionality.noiseLevel.rating
  ];

  const utilityRatings = [
    formData.utility.electricity.rating,
    formData.utility.lighting.rating,
    formData.utility.internetConnectivity.rating
  ];

  const sanitationRatings = [
    formData.sanitation.cleanliness.rating,
    formData.sanitation.wasteDisposal.rating,
    formData.sanitation.odor.rating,
    formData.sanitation.comfortRoomAccess.rating
  ];

  const equipmentRatings = [
    formData.equipment.projectorTvMonitorSpeakersMic.rating
  ];

  const furnitureFixturesRatings = [
    formData.furnitureFixtures.chairsDesks.rating,
    formData.furnitureFixtures.neutralDesk.rating,
    formData.furnitureFixtures.teachersTablePodium.rating,
    formData.furnitureFixtures.whiteboardBlackboard.rating
  ];

  const spaceRatings = [
    formData.space.roomCapacity.rating,
    formData.space.layout.rating,
    formData.space.storage.rating
  ];

  const disasterPreparednessRatings = [
    formData.disasterPreparedness.emergencyExitsFireSafety.rating,
    formData.disasterPreparedness.earthquakePreparedness.rating,
    formData.disasterPreparedness.floodSafety.rating,
    formData.disasterPreparedness.safetySignages.rating
  ];

  const inclusivityRatings = [
    formData.inclusivity.privacyInComfortRooms.rating,
    formData.inclusivity.genderNeutralRestrooms.rating,
    formData.inclusivity.safeSpaces.rating,
    formData.inclusivity.classroomAssignmentSpecialNeeds.rating
  ];

  // Calculate scores for each category
  const categories: CategoryScore[] = [
    {
      name: 'Accessibility',
      totalRating: accessibilityRatings.reduce((a, b) => a + b, 0),
      maxPossibleScore: accessibilityRatings.length * 5,
      categoryScore: calculateCategoryScore(accessibilityRatings),
      weight: CLASSROOM_CATEGORY_WEIGHTS.accessibility,
      weightedScore: 0 // Will be calculated below
    },
    {
      name: 'Functionality',
      totalRating: functionalityRatings.reduce((a, b) => a + b, 0),
      maxPossibleScore: functionalityRatings.length * 5,
      categoryScore: calculateCategoryScore(functionalityRatings),
      weight: CLASSROOM_CATEGORY_WEIGHTS.functionality,
      weightedScore: 0
    },
    {
      name: 'Utility',
      totalRating: utilityRatings.reduce((a, b) => a + b, 0),
      maxPossibleScore: utilityRatings.length * 5,
      categoryScore: calculateCategoryScore(utilityRatings),
      weight: CLASSROOM_CATEGORY_WEIGHTS.utility,
      weightedScore: 0
    },
    {
      name: 'Sanitation',
      totalRating: sanitationRatings.reduce((a, b) => a + b, 0),
      maxPossibleScore: sanitationRatings.length * 5,
      categoryScore: calculateCategoryScore(sanitationRatings),
      weight: CLASSROOM_CATEGORY_WEIGHTS.sanitation,
      weightedScore: 0
    },
    {
      name: 'Equipment',
      totalRating: equipmentRatings.reduce((a, b) => a + b, 0),
      maxPossibleScore: equipmentRatings.length * 5,
      categoryScore: calculateCategoryScore(equipmentRatings),
      weight: CLASSROOM_CATEGORY_WEIGHTS.equipment,
      weightedScore: 0
    },
    {
      name: 'Furniture and Fixtures',
      totalRating: furnitureFixturesRatings.reduce((a, b) => a + b, 0),
      maxPossibleScore: furnitureFixturesRatings.length * 5,
      categoryScore: calculateCategoryScore(furnitureFixturesRatings),
      weight: CLASSROOM_CATEGORY_WEIGHTS.furnitureFixtures,
      weightedScore: 0
    },
    {
      name: 'Space',
      totalRating: spaceRatings.reduce((a, b) => a + b, 0),
      maxPossibleScore: spaceRatings.length * 5,
      categoryScore: calculateCategoryScore(spaceRatings),
      weight: CLASSROOM_CATEGORY_WEIGHTS.space,
      weightedScore: 0
    },
    {
      name: 'Disaster Preparedness',
      totalRating: disasterPreparednessRatings.reduce((a, b) => a + b, 0),
      maxPossibleScore: disasterPreparednessRatings.length * 5,
      categoryScore: calculateCategoryScore(disasterPreparednessRatings),
      weight: CLASSROOM_CATEGORY_WEIGHTS.disasterPreparedness,
      weightedScore: 0
    },
    {
      name: 'Inclusivity',
      totalRating: inclusivityRatings.reduce((a, b) => a + b, 0),
      maxPossibleScore: inclusivityRatings.length * 5,
      categoryScore: calculateCategoryScore(inclusivityRatings),
      weight: CLASSROOM_CATEGORY_WEIGHTS.inclusivity,
      weightedScore: 0
    }
  ];

  // Calculate weighted scores
  categories.forEach(category => {
    category.weightedScore = calculateWeightedScore(category.categoryScore, category.weight);
  });

  return categories;
}

/**
 * Calculate overall weighted score
 * Sum of all weighted scores (0-100)
 */
export function calculateOverallWeightedScore(categoryScores: CategoryScore[]): number {
  return categoryScores.reduce((sum, category) => sum + category.weightedScore, 0);
}

/**
 * Get rating interpretation based on overall weighted score
 */
export function getRatingInterpretation(overallScore: number): string {
  if (overallScore >= 90) return 'Outstanding Performance';
  if (overallScore >= 80) return 'Very Good';
  if (overallScore >= 70) return 'Good';
  if (overallScore >= 60) return 'Satisfactory';
  if (overallScore >= 50) return 'Fair';
  return 'Needs Significant Improvement';
}

/**
 * Get overall condition based on overall weighted score
 */
export function getOverallCondition(overallScore: number): string {
  if (overallScore >= 85) return 'Excellent';
  if (overallScore >= 70) return 'Good';
  if (overallScore >= 50) return 'Needs Improvement';
  return 'Unusable';
}

/**
 * Get category average (for display purposes)
 */
export function getCategoryAverage(totalRating: number, numberOfItems: number): number {
  return numberOfItems > 0 ? totalRating / numberOfItems : 0;
}
