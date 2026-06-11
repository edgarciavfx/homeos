import { NextRequest } from "next/server";
import { protectedRoute } from "@/lib/api/api-handler";
import { ok, created } from "@/lib/api/api-response";
import { BudgetRepository } from "@/infrastructure/repositories/budget.repository";
import { PurchaseRepository } from "@/infrastructure/repositories/purchase.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { CreateBudgetService } from "@/application/budgets/create-budget.service";
import { GetBudgetSummaryQuery } from "@/application/queries/budgets/get-budget-summary.query";

const createBudgetService = new CreateBudgetService(
  new BudgetRepository(),
  new HouseholdMemberRepository(),
);

const getBudgetSummaryQuery = new GetBudgetSummaryQuery(
  new BudgetRepository(),
  new PurchaseRepository(),
);

export const GET = protectedRoute(async (_req, { params }) => {
  const { householdId } = await params;
  const result = await getBudgetSummaryQuery.execute(householdId);
  return ok(result);
});

export const POST = protectedRoute(async (req, { params, userId }) => {
  const { householdId } = await params;
  const body = await req.json();
  const result = await createBudgetService.execute({
    householdId,
    userId,
    month: body.month,
    year: body.year,
    amount: body.amount,
  });
  return created(result);
});
