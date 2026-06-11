import { NextRequest } from "next/server";
import { protectedRoute } from "@/lib/api/api-handler";
import { created } from "@/lib/api/api-response";
import { ScheduledMealRepository } from "@/infrastructure/repositories/scheduled-meal.repository";
import { MealRepository } from "@/infrastructure/repositories/meal.repository";
import { WeeklyPlanRepository } from "@/infrastructure/repositories/weekly-plan.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { ScheduleMealService } from "@/application/meals/schedule-meal.service";

const scheduleMealService = new ScheduleMealService(
  new ScheduledMealRepository(),
  new MealRepository(),
  new WeeklyPlanRepository(),
  new HouseholdMemberRepository(),
);

export const POST = protectedRoute(async (req, { params, userId }) => {
  const { planId } = await params;
  const body = await req.json();
  const result = await scheduleMealService.execute({
    weeklyPlanId: planId,
    userId,
    mealId: body.mealId,
    scheduledDate: body.scheduledDate,
  });
  return created(result);
});
