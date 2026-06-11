"use client";

import Link from "next/link";
import type { DashboardSummaryView } from "@/application/queries/dashboard/get-dashboard-summary.query";

interface GroceryProgressCardProps {
  dashboard: DashboardSummaryView;
}

export function GroceryProgressCard({ dashboard }: GroceryProgressCardProps) {
  const { purchasedCount, remainingCount } = dashboard.groceryProgress;
  const total = purchasedCount + remainingCount;

  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-sm font-medium text-neutral-500">Grocery Progress</h3>
      {total > 0 ? (
        <div className="mt-2">
          <p className="text-sm text-neutral-600">
            {purchasedCount} of {total} items
          </p>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full rounded-full bg-neutral-900 transition-all"
              style={{ width: `${(purchasedCount / total) * 100}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm text-neutral-500">No grocery list</p>
      )}
      <Link href="/groceries" className="mt-2 inline-block text-xs text-neutral-900 underline">
        View Groceries
      </Link>
    </div>
  );
}
