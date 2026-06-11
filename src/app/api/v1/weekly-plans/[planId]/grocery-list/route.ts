import { protectedRoute } from "@/lib/api/api-handler";
import { created } from "@/lib/api/api-response";
import { GroceryListRepository } from "@/infrastructure/repositories/grocery-list.repository";
import { GroceryItemRepository } from "@/infrastructure/repositories/grocery-item.repository";
import { ScheduledMealRepository } from "@/infrastructure/repositories/scheduled-meal.repository";
import { WeeklyPlanRepository } from "@/infrastructure/repositories/weekly-plan.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { GenerateGroceryListService } from "@/application/groceries/generate-grocery-list.service";

const service = new GenerateGroceryListService(
  new GroceryListRepository(),
  new GroceryItemRepository(),
  new ScheduledMealRepository(),
  new WeeklyPlanRepository(),
  new HouseholdMemberRepository(),
);

export const POST = protectedRoute(async (_req, { params, userId }) => {
  const { planId } = await params;
  const plan = await new WeeklyPlanRepository().findById(planId);
  const result = await service.execute({
    householdId: plan!.householdId,
    weeklyPlanId: planId,
    userId,
  });
  return created(result);
});
