"use client";

import { useState } from "react";
import { useCreatePriority } from "@/hooks/use-planning";

interface Recommendation {
  title: string;
  suggestedOwnerId?: string;
  suggestedDate?: Date;
  priorityScore: number;
}

interface RecommendationPanelProps {
  planId: string;
  recommendations: Recommendation[];
  onDismiss: () => void;
}

export function RecommendationPanel({
  planId,
  recommendations,
  onDismiss,
}: RecommendationPanelProps) {
  const createPriority = useCreatePriority(planId);
  const [added, setAdded] = useState<Set<number>>(new Set());
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  const visible = recommendations.filter((_, i) => !dismissed.has(i));

  const handleAdd = async (index: number, rec: Recommendation) => {
    await createPriority.mutateAsync({
      title: rec.title,
      ownerId: rec.suggestedOwnerId,
      targetDate: rec.suggestedDate ? rec.suggestedDate.toISOString().split("T")[0] : undefined,
    });
    setAdded((prev) => new Set(prev).add(index));
  };

  const handleAddAll = async () => {
    for (let i = 0; i < recommendations.length; i++) {
      if (!added.has(i) && !dismissed.has(i)) {
        await handleAdd(i, recommendations[i]);
      }
    }
  };

  if (visible.length === 0) return null;

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-medium">Recommended Priorities</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddAll}
            disabled={createPriority.isPending}
            className="rounded bg-neutral-900 px-3 py-1 text-xs text-white disabled:opacity-50"
          >
            Add All
          </button>
          <button onClick={onDismiss} className="rounded border px-3 py-1 text-xs">
            Dismiss All
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {visible.map((rec, i) => {
          const originalIndex = recommendations.indexOf(rec);
          const isAdded = added.has(originalIndex);
          return (
            <div
              key={originalIndex}
              className={`flex items-center justify-between rounded border px-3 py-2 text-sm ${
                isAdded ? "bg-neutral-50 opacity-60" : ""
              }`}
            >
              <div className="flex-1">
                <span className={isAdded ? "line-through" : ""}>{rec.title}</span>
                <span className="ml-2 text-xs text-neutral-400">
                  (score: {rec.priorityScore.toFixed(1)})
                </span>
              </div>
              <div className="flex items-center gap-1">
                {!isAdded && (
                  <button
                    onClick={() => handleAdd(originalIndex, rec)}
                    disabled={createPriority.isPending}
                    className="rounded bg-neutral-900 px-2 py-0.5 text-xs text-white disabled:opacity-50"
                  >
                    Add
                  </button>
                )}
                <button
                  onClick={() => setDismissed((prev) => new Set(prev).add(originalIndex))}
                  className="rounded border px-2 py-0.5 text-xs"
                >
                  {isAdded ? "Added" : "Dismiss"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {createPriority.isError && (
        <p className="mt-2 text-sm text-red-600">
          {createPriority.error instanceof Error
            ? createPriority.error.message
            : "Failed to add priority"}
        </p>
      )}
    </div>
  );
}
