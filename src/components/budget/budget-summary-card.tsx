"use client";

import { useBudget } from "@/hooks/use-budgets";

interface BudgetSummaryCardProps {
  householdId: string;
}

export function BudgetSummaryCard({ householdId }: BudgetSummaryCardProps) {
  const { data, isLoading } = useBudget(householdId);

  if (isLoading) {
    return (
      <div className="rounded-lg border p-4">
        <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
        <div className="mt-3 h-8 w-32 animate-pulse rounded bg-neutral-200" />
        <div className="mt-2 h-2 animate-pulse rounded bg-neutral-200" />
      </div>
    );
  }

  if (!data) return null;

  const pct = data.amount > 0 ? Math.min((data.spent / data.amount) * 100, 100) : 0;
  const isOver = data.isOverBudget;

  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-sm font-medium text-neutral-500">Monthly Budget</h3>
      <p className="mt-1 text-2xl font-bold">${data.remaining.toFixed(2)}</p>
      <p className="text-xs text-neutral-500">remaining of ${data.amount.toFixed(2)}</p>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className={`h-full rounded-full transition-all ${isOver ? "bg-red-500" : "bg-neutral-900"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-neutral-500">
        ${data.spent.toFixed(2)} spent
        {isOver && <span className="ml-1 text-red-600">(over budget!)</span>}
      </p>
    </div>
  );
}
