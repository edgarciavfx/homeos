export interface IngredientView {
  id: string;
  mealId: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface MealDetailView {
  id: string;
  name: string;
  preparationMinutes: number;
  archived: boolean;
  ingredients: IngredientView[];
}

export interface MealSummaryView {
  id: string;
  name: string;
  preparationMinutes: number;
  ingredientCount: number;
  archived: boolean;
}

export interface MealLibraryResult {
  meals: MealDetailView[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MealRecommendationView {
  mealId: string;
  mealName: string;
  score: number;
}
