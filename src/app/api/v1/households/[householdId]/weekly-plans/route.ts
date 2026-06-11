import { NextRequest } from "next/server";
import { protectedRoute } from "@/lib/api/api-handler";
import { created, ok } from "@/lib/api/api-response";
import { WeeklyPlanRepository } from "@/infrastructure/repositories/weekly-plan.repository";
import { WeeklyPriorityRepository } from "@/infrastructure/repositories/weekly-priority.repository";
import { ChoreOccurrenceRepository } from "@/infrastructure/repositories/chore-occurrence.repository";
import { OwnershipRepository } from "@/infrastructure/repositories/ownership.repository";
import { BudgetRepository } from "@/infrastructure/repositories/budget.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { GenerateWeeklyPlanService } from "@/application/planning/generate-weekly-plan.service";
import { GetCurrentWeeklyPlanQuery } from "@/application/queries/planning/get-current-weekly-plan.query";

const generateService = new GenerateWeeklyPlanService(
  new WeeklyPlanRepository(),
  new WeeklyPriorityRepository(),
  new ChoreOccurrenceRepository(),
  new OwnershipRepository(),
  new BudgetRepository(),
  new HouseholdMemberRepository(),
);

const getCurrentPlanQuery = new GetCurrentWeeklyPlanQuery(new WeeklyPlanRepository());

export const GET = protectedRoute(async (_req, { params }) => {
  const { householdId } = await params;
  const plan = await getCurrentPlanQuery.execute(householdId);
  return ok(plan);
});

export const POST = protectedRoute(async (req, { params, userId }) => {
  const { householdId } = await params;
  const body = await req.json();
  const result = await generateService.execute({
    householdId,
    userId,
    weekStartDate: body.weekStartDate,
  });
  return created(result);
});
