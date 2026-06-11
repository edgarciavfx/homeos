export interface MealRecommendationView {
  mealId: string;
  mealName: string;
  score: number;
}

export class GetMealRecommendationsQuery {
  async execute(_householdId: string) {
    return { recommendations: [] as MealRecommendationView[] };
  }
}
