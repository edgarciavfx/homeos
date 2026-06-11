"use client";

import { useHousehold } from "@/components/household-context-provider";
import { useCurrentWeeklyPlan } from "@/hooks/use-planning";
import { useCurrentGroceryList, useGenerateGroceryList } from "@/hooks/use-groceries";
import { GroceryListView } from "@/components/groceries/GroceryListView";

export default function GroceriesPage() {
  const { householdId, isLoading: householdLoading } = useHousehold();
  const { data: plan, isLoading: planLoading } = useCurrentWeeklyPlan(householdId);
  const { data: list, isLoading: listLoading, error } = useCurrentGroceryList(householdId);
  const generateList = useGenerateGroceryList();

  const isLoading = householdLoading || planLoading || listLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Groceries</h1>
        <div className="space-y-4">
          <div className="h-16 animate-pulse rounded-lg bg-neutral-200" />
          <div className="h-24 animate-pulse rounded-lg bg-neutral-200" />
          <div className="h-24 animate-pulse rounded-lg bg-neutral-200" />
        </div>
      </div>
    );
  }

  if (!householdId) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Groceries</h1>
        <div className="rounded-lg border p-6 text-center">
          <p className="text-sm text-neutral-500">
            Create or join a household to manage groceries.
          </p>
          <a href="/settings" className="mt-2 inline-block text-sm text-neutral-900 underline">
            Go to Settings
          </a>
        </div>
      </div>
    );
  }

  const hasPlan = !!plan;
  const hasList = !!list;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Groceries</h1>
        {hasPlan && !hasList && (
          <button
            onClick={() => generateList.mutateAsync(plan!.id)}
            disabled={generateList.isPending}
            className="rounded bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {generateList.isPending ? "Generating..." : "Generate Grocery List"}
          </button>
        )}
      </div>

      {hasList && plan && <GroceryListView list={list} weeklyPlanId={plan.id} />}

      {!hasList && hasPlan && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-neutral-500">
            Generate a grocery list from your weekly meal plan.
          </p>
        </div>
      )}

      {!hasPlan && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-neutral-500">
            Create a weekly plan first to generate a grocery list.
          </p>
          <a href="/planning" className="mt-2 inline-block text-sm text-neutral-900 underline">
            Go to Planning
          </a>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 p-4 text-sm text-red-600">
          {error instanceof Error ? error.message : "Failed to load grocery list"}
        </div>
      )}
    </div>
  );
}
