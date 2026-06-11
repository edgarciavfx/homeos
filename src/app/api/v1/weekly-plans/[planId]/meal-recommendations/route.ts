import { protectedRoute } from "@/lib/api/api-handler";
import { ok } from "@/lib/api/api-response";
import { MealRepository } from "@/infrastructure/repositories/meal.repository";
import { ScheduledMealRepository } from "@/infrastructure/repositories/scheduled-meal.repository";
import { WeeklyPlanRepository } from "@/infrastructure/repositories/weekly-plan.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { GenerateMealRecommendationsService } from "@/application/meals/generate-meal-recommendations.service";

const service = new GenerateMealRecommendationsService(
  new MealRepository(),
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
  return ok(result);
});
