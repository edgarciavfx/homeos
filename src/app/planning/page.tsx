"use client";

import { useHousehold } from "@/components/household-context-provider";
import { useCurrentWeeklyPlan } from "@/hooks/use-planning";
import { PlanningInputsPanel } from "@/components/planning/PlanningInputsPanel";
import { WeeklyPriorityEditor } from "@/components/planning/WeeklyPriorityEditor";
import { WeeklyPlanActions } from "@/components/planning/WeeklyPlanActions";
import { WeeklyMealCalendar } from "@/components/planning/WeeklyMealCalendar";

export default function PlanningPage() {
  const { householdId, isLoading: householdLoading } = useHousehold();
  const { data: plan, isLoading: planLoading, error } = useCurrentWeeklyPlan(householdId);

  if (householdLoading || planLoading) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Weekly Planning</h1>
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-lg bg-neutral-200" />
          <div className="h-48 animate-pulse rounded-lg bg-neutral-200" />
          <div className="h-32 animate-pulse rounded-lg bg-neutral-200" />
        </div>
      </div>
    );
  }

  if (!householdId) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Weekly Planning</h1>
        <div className="rounded-lg border p-6 text-center">
          <p className="text-sm text-neutral-500">
            Create or join a household to start planning your week.
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
      <h1 className="text-2xl font-bold">Weekly Planning</h1>

      <PlanningInputsPanel householdId={householdId} hasPlan={!!plan} />

      {plan && (
        <>
          <WeeklyPlanActions planId={plan.id} status={plan.status} householdId={householdId} />
          <WeeklyMealCalendar
            planId={plan.id}
            weekStartDate={plan.weekStartDate}
            meals={plan.meals}
            householdId={householdId}
          />
          <WeeklyPriorityEditor planId={plan.id} priorities={plan.priorities} />
        </>
      )}

      {!plan && (
        <div className="rounded-lg border p-6 text-center">
          <p className="text-sm text-neutral-500">
            No weekly plan yet. Generate one to get started.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 p-4 text-sm text-red-600">
          {error instanceof Error ? error.message : "Failed to load plan"}
        </div>
      )}
    </div>
  );
}
