"use client";

import { useOverdueChores, useCompleteChoreOccurrence } from "@/hooks/use-chores";

interface ChoreOccurrenceTableProps {
  householdId: string;
}

export function ChoreOccurrenceTable({ householdId }: ChoreOccurrenceTableProps) {
  const { data: overdue, isLoading } = useOverdueChores(householdId);
  const completeOccurrence = useCompleteChoreOccurrence();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-6 w-40 animate-pulse rounded bg-neutral-200" />
        <div className="h-20 animate-pulse rounded-lg border bg-neutral-100" />
      </div>
    );
  }

  if (!overdue || overdue.length === 0) {
    return null;
  }

  const handleComplete = async (occurrenceId: string) => {
    await completeOccurrence.mutateAsync(occurrenceId);
  };

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-red-600">Overdue Chores ({overdue.length})</h3>
      <div className="space-y-2">
        {overdue.map((occ: any) => (
          <div
            key={occ.id || occ.occurrenceId}
            className="flex items-center justify-between rounded border border-red-200 bg-red-50 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium">{occ.chore?.name ?? occ.choreName}</p>
              <p className="text-xs text-red-500">
                Due: {new Date(occ.dueDate).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => handleComplete(occ.id || occ.occurrenceId)}
              disabled={completeOccurrence.isPending}
              className="rounded bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-700 disabled:opacity-50"
            >
              {completeOccurrence.isPending ? "..." : "Complete"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
