export interface MealSummaryView {
  id: string;
  name: string;
  preparationMinutes: number;
  ingredientCount: number;
  archived: boolean;
}

export interface MealRecommendationView {
  mealId: string;
  mealName: string;
  score: number;
}
