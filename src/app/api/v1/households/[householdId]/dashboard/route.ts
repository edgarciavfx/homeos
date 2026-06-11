import { protectedRoute } from "@/lib/api/api-handler";
import { ok } from "@/lib/api/api-response";
import { GetDashboardSummaryQuery } from "@/application/queries/dashboard/get-dashboard-summary.query";
import { WeeklyPlanRepository } from "@/infrastructure/repositories/weekly-plan.repository";
import { ScheduledMealRepository } from "@/infrastructure/repositories/scheduled-meal.repository";
import { GroceryListRepository } from "@/infrastructure/repositories/grocery-list.repository";
import { ChoreOccurrenceRepository } from "@/infrastructure/repositories/chore-occurrence.repository";
import { BudgetRepository } from "@/infrastructure/repositories/budget.repository";
import { HouseholdRepository } from "@/infrastructure/repositories/household.repository";

const getDashboardSummaryQuery = new GetDashboardSummaryQuery(
  new HouseholdRepository(),
  new WeeklyPlanRepository(),
  new ScheduledMealRepository(),
  new GroceryListRepository(),
  new ChoreOccurrenceRepository(),
  new BudgetRepository(),
);

export const GET = protectedRoute(async (_req, { params }) => {
  const { householdId } = await params;
  const result = await getDashboardSummaryQuery.execute(householdId);
  return ok(result);
});
