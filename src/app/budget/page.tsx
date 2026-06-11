"use client";

import { useHousehold } from "@/components/household-context-provider";
import { useBudget } from "@/hooks/use-budgets";
import { BudgetSummaryCard } from "@/components/budget/budget-summary-card";
import { BudgetForm } from "@/components/budget/budget-form";
import { PurchaseTable } from "@/components/budget/purchase-table";
import { PurchaseForm } from "@/components/budget/purchase-form";

export default function BudgetPage() {
  const { householdId, isLoading: householdLoading } = useHousehold();
  const { data: budget, isLoading: budgetLoading } = useBudget(householdId);

  if (householdLoading || budgetLoading) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Budget</h1>
        <p className="text-sm text-neutral-500">Food budget and spending tracking</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-32 animate-pulse rounded-lg bg-neutral-200" />
          <div className="h-48 animate-pulse rounded-lg bg-neutral-200" />
        </div>
      </div>
    );
  }

  if (!householdId) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Budget</h1>
        <div className="rounded-lg border p-6 text-center">
          <p className="text-sm text-neutral-500">
            Create or join a household to start budgeting.
          </p>
          <a href="/settings" className="mt-2 inline-block text-sm text-neutral-900 underline">
            Go to Settings
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Budget</h1>
        <p className="text-sm text-neutral-500">Food budget and spending tracking</p>
      </div>

      {budget ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <BudgetSummaryCard householdId={householdId} />
            <PurchaseForm budgetId={budget.id} />
          </div>
          <div>
            <PurchaseTable budgetId={budget.id} />
          </div>
        </div>
      ) : (
        <div className="max-w-md">
          <BudgetForm householdId={householdId} />
        </div>
      )}
    </div>
  );
}
