import { GroceryListRepository } from "@/infrastructure/repositories/grocery-list.repository";
import { GroceryItemRepository } from "@/infrastructure/repositories/grocery-item.repository";
import { ScheduledMealRepository } from "@/infrastructure/repositories/scheduled-meal.repository";
import { WeeklyPlanRepository } from "@/infrastructure/repositories/weekly-plan.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { transaction } from "@/infrastructure/prisma/transaction-manager";
import { aggregateIngredients, IngredientInput } from "@/infrastructure/recommendations/ingredient-aggregator";
import { ForbiddenError, NotFoundError } from "@/lib/api/api-error";

export interface GenerateGroceryListInput {
  householdId: string;
  weeklyPlanId: string;
  userId: string;
}

export interface GenerateGroceryListOutput {
  groceryListId: string;
  itemCount: number;
}

export class GenerateGroceryListService {
  constructor(
    private groceryListRepository: GroceryListRepository,
    private groceryItemRepository: GroceryItemRepository,
    private scheduledMealRepository: ScheduledMealRepository,
    private weeklyPlanRepository: WeeklyPlanRepository,
    private memberRepository: HouseholdMemberRepository,
  ) {}

  async execute(input: GenerateGroceryListInput): Promise<GenerateGroceryListOutput> {
    const membership = await this.memberRepository.findByUserAndHousehold(
      input.userId,
      input.householdId,
    );
    if (!membership) throw new ForbiddenError();

    const plan = await this.weeklyPlanRepository.findById(input.weeklyPlanId);
    if (!plan) throw new NotFoundError("Weekly plan not found");

    const scheduledMeals = await this.scheduledMealRepository.findByWeeklyPlan(input.weeklyPlanId);

    const ingredientInputs: IngredientInput[] = [];
    for (const sm of scheduledMeals) {
      for (const ingredient of sm.meal.ingredients) {
        ingredientInputs.push({
          name: ingredient.name,
          quantity: Number(ingredient.quantity),
          unit: ingredient.unit,
        });
      }
    }

    const aggregated = aggregateIngredients(ingredientInputs);

    return transaction(async (tx) => {
      const existingList = await this.groceryListRepository.findByWeeklyPlan(input.weeklyPlanId);

      if (existingList) {
        const manualItems = existingList.items.filter((i) => i.source === "MANUAL" && !i.completed);
        await this.groceryItemRepository.deleteGeneratedByList(existingList.id, tx);

        await this.groceryItemRepository.createMany(
          aggregated.map((item) => ({
            groceryListId: existingList.id,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            source: "GENERATED" as const,
          })),
          tx,
        );

        await this.groceryItemRepository.createMany(
          manualItems.map((item) => ({
            groceryListId: existingList.id,
            name: item.name,
            quantity: Number(item.quantity) ?? undefined,
            unit: item.unit ?? undefined,
            category: item.category ?? undefined,
            source: "MANUAL" as const,
          })),
          tx,
        );

        return { groceryListId: existingList.id, itemCount: aggregated.length };
      }

      const groceryList = await this.groceryListRepository.create(
        {
          householdId: input.householdId,
          weeklyPlanId: input.weeklyPlanId,
        },
        tx,
      );

      if (aggregated.length > 0) {
        await this.groceryItemRepository.createMany(
          aggregated.map((item) => ({
            groceryListId: groceryList.id,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            source: "GENERATED" as const,
          })),
          tx,
        );
      }

      return { groceryListId: groceryList.id, itemCount: aggregated.length };
    });
  }
}
