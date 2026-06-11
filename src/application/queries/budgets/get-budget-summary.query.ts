import { BudgetRepository } from "@/infrastructure/repositories/budget.repository";
import { PurchaseRepository } from "@/infrastructure/repositories/purchase.repository";

export interface BudgetSummaryView {
  amount: number;
  spent: number;
  remaining: number;
  isOverBudget: boolean;
}

export class GetBudgetSummaryQuery {
  constructor(
    private budgetRepository: BudgetRepository,
    private purchaseRepository: PurchaseRepository,
  ) {}

  async execute(householdId: string): Promise<BudgetSummaryView | null> {
    const budget = await this.budgetRepository.findCurrent(householdId);
    if (!budget) return null;

    const spent = await this.purchaseRepository.sumByBudget(budget.id);
    const amount = Number(budget.amount);
    const remaining = amount - spent;

    return {
      amount,
      spent,
      remaining,
      isOverBudget: remaining < 0,
    };
  }
}
