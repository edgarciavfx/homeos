import { protectedRoute } from "@/lib/api/api-handler";
import { ok } from "@/lib/api/api-response";
import { BudgetRepository } from "@/infrastructure/repositories/budget.repository";
import { PurchaseRepository } from "@/infrastructure/repositories/purchase.repository";

export const GET = protectedRoute(async (_req, { params }) => {
  const { budgetId } = await params;
  const budget = await new BudgetRepository().findById(budgetId);
  if (!budget) return ok(null);

  const spent = await new PurchaseRepository().sumByBudget(budgetId);
  return ok({
    id: budget.id,
    amount: Number(budget.amount),
    spent,
    remaining: Number(budget.amount) - spent,
  });
});
