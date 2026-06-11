import { NextRequest } from "next/server";
import { protectedRoute } from "@/lib/api/api-handler";
import { created } from "@/lib/api/api-response";
import { BudgetRepository } from "@/infrastructure/repositories/budget.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { CreateBudgetService } from "@/application/budgets/create-budget.service";

const createBudgetService = new CreateBudgetService(
  new BudgetRepository(),
  new HouseholdMemberRepository(),
);

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
