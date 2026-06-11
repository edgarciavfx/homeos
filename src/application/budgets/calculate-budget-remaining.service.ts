import { BudgetRepository } from "@/infrastructure/repositories/budget.repository";
import { PurchaseRepository } from "@/infrastructure/repositories/purchase.repository";
import { NotFoundError } from "@/lib/api/api-error";

export interface CalculateBudgetRemainingInput {
  householdId: string;
  month: number;
  year: number;
}

export interface CalculateBudgetRemainingOutput {
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  isOverBudget: boolean;
}

export class CalculateBudgetRemainingService {
  constructor(
    private budgetRepository: BudgetRepository,
    private purchaseRepository: PurchaseRepository,
  ) {}

  async execute(input: CalculateBudgetRemainingInput): Promise<CalculateBudgetRemainingOutput> {
    const budget = await this.budgetRepository.findByHouseholdAndMonth(
      input.householdId,
      input.month,
      input.year,
    );

    if (!budget) throw new NotFoundError("Budget not found for this month");

    const spent = await this.purchaseRepository.sumByBudget(budget.id);
    const budgetAmount = Number(budget.amount);
    const remaining = budgetAmount - spent;

    return {
      budgetAmount,
      spentAmount: spent,
      remainingAmount: remaining,
      isOverBudget: remaining < 0,
    };
  }
}
