"use client";

import { useGenerateWeeklyPlan } from "@/hooks/use-planning";
import { getWeekStartDate, formatDate } from "@/lib/dates/date-utils";

interface PlanningInputsPanelProps {
  householdId: string;
  hasPlan: boolean;
}

export function PlanningInputsPanel({ householdId, hasPlan }: PlanningInputsPanelProps) {
  const generatePlan = useGenerateWeeklyPlan();
  const weekStart = getWeekStartDate(new Date());
  const weekStartStr = formatDate(weekStart);

  const handleGenerate = async () => {
    await generatePlan.mutateAsync({
      householdId,
      weekStartDate: weekStartStr,
    });
  };

  if (hasPlan) return null;

  return (
    <div className="rounded-lg border p-4">
      <h2 className="mb-1 font-medium">Start Planning</h2>
      <p className="mb-3 text-sm text-neutral-500">
        Generate a weekly plan starting {weekStartStr}
      </p>
      <button
        onClick={handleGenerate}
        disabled={generatePlan.isPending}
        className="rounded bg-neutral-900 px-4 py-1.5 text-sm text-white disabled:opacity-50"
      >
        {generatePlan.isPending ? "Generating..." : "Generate Weekly Plan"}
      </button>
      {generatePlan.isError && (
        <p className="mt-2 text-sm text-red-600">
          {generatePlan.error instanceof Error
            ? generatePlan.error.message
            : "Failed to generate plan"}
        </p>
      )}
    </div>
  );
}
