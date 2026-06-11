"use client";

import Link from "next/link";
import type { DashboardSummaryView } from "@/application/queries/dashboard/get-dashboard-summary.query";

interface BudgetSnapshotCardProps {
  dashboard: DashboardSummaryView;
}

export function BudgetSnapshotCard({ dashboard }: BudgetSnapshotCardProps) {
  const budget = dashboard.budgetSnapshot;

  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-sm font-medium text-neutral-500">Budget</h3>
      {budget ? (
        <div className="mt-2">
          <p className="text-2xl font-bold">${budget.remaining.toFixed(2)}</p>
          <p className="text-xs text-neutral-500">
            remaining of ${budget.amount.toFixed(2)}
          </p>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-neutral-200">
            <div
              className={`h-full rounded-full transition-all ${
                budget.remaining < 0 ? "bg-red-500" : "bg-neutral-900"
              }`}
              style={{
                width: `${budget.amount > 0 ? Math.min((budget.spent / budget.amount) * 100, 100) : 0}%`,
              }}
            />
          </div>
          {budget.remaining < 0 && (
            <p className="mt-1 text-xs text-red-600">
              ${Math.abs(budget.remaining).toFixed(2)} over budget!
            </p>
          )}
        </div>
      ) : (
        <p className="mt-2 text-sm text-neutral-500">No budget set</p>
      )}
      <Link href="/budget" className="mt-2 inline-block text-xs text-neutral-900 underline">
        Manage Budget
      </Link>
    </div>
  );
}
