"use client";

import { useState } from "react";
import { useChores, useCompleteChoreOccurrence } from "@/hooks/use-chores";
import { ChoreForm } from "./ChoreForm";

interface ChoreListProps {
  householdId: string;
}

export function ChoreList({ householdId }: ChoreListProps) {
  const [showForm, setShowForm] = useState(false);
  const { data: chores, isLoading } = useChores(householdId);
  const completeOccurrence = useCompleteChoreOccurrence();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-8 w-full animate-pulse rounded bg-neutral-200" />
        <div className="h-16 animate-pulse rounded-lg border bg-neutral-100" />
        <div className="h-16 animate-pulse rounded-lg border bg-neutral-100" />
      </div>
    );
  }

  const getNextPendingOccurrence = (occurrences: any[]) => {
    return occurrences
      .filter((o: any) => !o.completedAt)
      .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
  };

  const handleComplete = async (occurrenceId: string) => {
    await completeOccurrence.mutateAsync(occurrenceId);
  };

  const frequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      DAILY: "Daily",
      WEEKLY: "Weekly",
      BIWEEKLY: "Biweekly",
      MONTHLY: "Monthly",
    };
    return labels[freq] ?? freq;
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">All Chores</h2>
        <button
          onClick={() => setShowForm(true)}
          className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-800"
        >
          Add Chore
        </button>
      </div>

      {chores && chores.length > 0 && (
        <div className="space-y-2">
          {chores.map((chore) => {
            const next = getNextPendingOccurrence(chore.occurrences);
            const overdue = next && isOverdue(next.dueDate);

            return (
              <div
                key={chore.id}
                className={`flex items-center justify-between rounded border px-4 py-3 ${
                  overdue ? "border-amber-200 bg-amber-50" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{chore.name}</span>
                    <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-500">
                      {frequencyLabel(chore.frequency)}
                    </span>
                    {!chore.active && (
                      <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-400">
                        Inactive
                      </span>
                    )}
                  </div>
                  {next && (
                    <p
                      className={`mt-0.5 text-xs ${
                        overdue ? "text-amber-600" : "text-neutral-500"
                      }`}
                    >
                      Next due: {new Date(next.dueDate).toLocaleDateString()}
                      {overdue && " (overdue)"}
                    </p>
                  )}
                </div>
                {next && (
                  <button
                    onClick={() => handleComplete(next.id)}
                    disabled={completeOccurrence.isPending}
                    className="rounded bg-neutral-900 px-3 py-1.5 text-xs text-white hover:bg-neutral-800 disabled:opacity-50"
                  >
                    {completeOccurrence.isPending ? "..." : "Complete"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {chores && chores.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-neutral-500">
            No chores yet. Add your first chore to get started.
          </p>
        </div>
      )}

      {showForm && <ChoreForm householdId={householdId} onClose={() => setShowForm(false)} />}
    </div>
  );
}
