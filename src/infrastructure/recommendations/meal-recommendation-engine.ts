export interface MealScoringInput {
  mealId: string;
  mealName: string;
  preparationMinutes: number;
  usageFrequency: number;
  recentUsageCount: number;
}

export interface MealRecommendation {
  mealId: string;
  mealName: string;
  preparationMinutes: number;
  recommendationScore: number;
}

export function scoreMeals(inputs: MealScoringInput[]): MealRecommendation[] {
  const scored = inputs.map((input) => {
    const frequencyScore = input.usageFrequency * 5;
    const recentPenalty = input.recentUsageCount * -10;
    const quickBonus = input.preparationMinutes <= 20 ? 30 : 0;

    const score = frequencyScore + recentPenalty + quickBonus;

    return {
      mealId: input.mealId,
      mealName: input.mealName,
      preparationMinutes: input.preparationMinutes,
      recommendationScore: score,
    };
  });

  return scored.sort((a, b) => b.recommendationScore - a.recommendationScore);
}
