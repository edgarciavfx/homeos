import { MealRepository } from "@/infrastructure/repositories/meal.repository";
import { transaction } from "@/infrastructure/prisma/transaction-manager";
import { NotFoundError } from "@/lib/api/api-error";

export class ArchiveMealService {
  constructor(private mealRepository: MealRepository) {}

  async execute(mealId: string) {
    const meal = await this.mealRepository.findById(mealId);
    if (!meal) throw new NotFoundError("Meal not found");

    return transaction(async (tx) => {
      return this.mealRepository.archive(mealId, tx);
    });
  }
}
