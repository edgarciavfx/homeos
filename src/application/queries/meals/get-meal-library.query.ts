import { MealRepository } from "@/infrastructure/repositories/meal.repository";

export interface MealSummaryView {
  id: string;
  name: string;
  preparationMinutes: number;
  ingredientCount: number;
  archived: boolean;
}

export class GetMealLibraryQuery {
  constructor(private mealRepository: MealRepository) {}

  async execute(householdId: string, options?: { archived?: boolean; page?: number; pageSize?: number }) {
    const result = await this.mealRepository.findByHousehold(householdId, options);

    return {
      meals: result.meals.map((m) => ({
        id: m.id,
        name: m.name,
        preparationMinutes: m.preparationMinutes,
        ingredientCount: m.ingredients.length,
        archived: m.archived,
      })),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }
}
