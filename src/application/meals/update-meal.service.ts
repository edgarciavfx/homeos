import { MealRepository } from "@/infrastructure/repositories/meal.repository";
import { transaction } from "@/infrastructure/prisma/transaction-manager";
import { NotFoundError } from "@/lib/api/api-error";

export interface UpdateMealInput {
  mealId: string;
  name?: string;
  preparationMinutes?: number;
}

export class UpdateMealService {
  constructor(private mealRepository: MealRepository) {}

  async execute(input: UpdateMealInput) {
    const meal = await this.mealRepository.findById(input.mealId);
    if (!meal) throw new NotFoundError("Meal not found");

    if (meal.archived) {
      throw new Error("Archived meals cannot be edited");
    }

    return transaction(async (tx) => {
      return this.mealRepository.update(
        input.mealId,
        { name: input.name, preparationMinutes: input.preparationMinutes },
        tx,
      );
    });
  }
}
