"use client";

import { useHousehold } from "@/components/household-context-provider";
import { useDashboardSummary } from "@/hooks/use-dashboard";
import { WeeklyPlanSummaryCard } from "@/components/dashboard/weekly-plan-summary-card";
import { UpcomingMealsCard } from "@/components/dashboard/upcoming-meals-card";
import { GroceryProgressCard } from "@/components/dashboard/grocery-progress-card";
import { OverdueChoresCard } from "@/components/dashboard/overdue-chores-card";
import { BudgetSnapshotCard } from "@/components/dashboard/budget-snapshot-card";

export default function DashboardPage() {
  const { householdId, isLoading: householdLoading } = useHousehold();
  const { data: dashboard, isLoading: dashboardLoading } = useDashboardSummary(householdId);

  if (householdLoading || dashboardLoading) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-neutral-200" />
          ))}
        </div>
      </div>
    );
  }

  if (!householdId) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="rounded-lg border p-6 text-center">
          <p className="text-sm text-neutral-500">
            Create or join a household to get started.
          </p>
          <a href="/settings" className="mt-2 inline-block text-sm text-neutral-900 underline">
            Go to Settings
          </a>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-neutral-500">Welcome to HomeOS</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-neutral-500">{dashboard.householdName}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <WeeklyPlanSummaryCard dashboard={dashboard} />
        <UpcomingMealsCard dashboard={dashboard} />
        <GroceryProgressCard dashboard={dashboard} />
        <OverdueChoresCard dashboard={dashboard} />
        <BudgetSnapshotCard dashboard={dashboard} />
      </div>
    </div>
  );
}
