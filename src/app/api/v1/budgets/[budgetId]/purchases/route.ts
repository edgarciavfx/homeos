import { NextRequest } from "next/server";
import { protectedRoute } from "@/lib/api/api-handler";
import { ok, created } from "@/lib/api/api-response";
import { PurchaseRepository } from "@/infrastructure/repositories/purchase.repository";
import { BudgetRepository } from "@/infrastructure/repositories/budget.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { RecordPurchaseService } from "@/application/budgets/record-purchase.service";

const recordPurchaseService = new RecordPurchaseService(
  new PurchaseRepository(),
  new BudgetRepository(),
  new HouseholdMemberRepository(),
);

export const GET = protectedRoute(async (req, { params }) => {
  const { budgetId } = await params;
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 20);
  const repo = new PurchaseRepository();
  const purchases = await repo.findByBudget(budgetId);
  return ok(purchases);
});

export const POST = protectedRoute(async (req, { params, userId }) => {
  const { budgetId } = await params;
  const body = await req.json();
  const result = await recordPurchaseService.execute({
    budgetId,
    userId,
    amount: body.amount,
    purchaseDate: body.purchaseDate,
    notes: body.notes,
  });
  return created(result);
});
