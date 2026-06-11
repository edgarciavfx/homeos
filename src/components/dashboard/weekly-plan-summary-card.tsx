"use client";

import Link from "next/link";
import type { DashboardSummaryView } from "@/application/queries/dashboard/get-dashboard-summary.query";

interface WeeklyPlanSummaryCardProps {
  dashboard: DashboardSummaryView;
}

export function WeeklyPlanSummaryCard({ dashboard }: WeeklyPlanSummaryCardProps) {
  const plan = dashboard.weeklyPlan;

  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-sm font-medium text-neutral-500">Weekly Plan</h3>
      {plan ? (
        <div className="mt-2">
          <span
            className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
              plan.status === "APPROVED"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {plan.status}
          </span>
          <p className="mt-1 text-sm text-neutral-600">
            {plan.priorityCount} priorit{plan.priorityCount === 1 ? "y" : "ies"}
          </p>
          <Link
            href="/planning"
            className="mt-2 inline-block text-xs text-neutral-900 underline"
          >
            View Plan
          </Link>
        </div>
      ) : (
        <div className="mt-2">
          <p className="text-sm text-neutral-500">No active plan</p>
          <Link
            href="/planning"
            className="mt-1 inline-block text-xs text-neutral-900 underline"
          >
            Create Plan
          </Link>
        </div>
      )}
    </div>
  );
}
