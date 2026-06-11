"use client";

import { useState } from "react";
import { useCreatePriority, useUpdatePriority, useDeletePriority } from "@/hooks/use-planning";

interface Priority {
  id: string;
  title: string;
  description: string | null;
  ownerId: string | null;
  targetDate: Date | null;
  completed: boolean;
}

interface WeeklyPriorityEditorProps {
  planId: string;
  priorities: Priority[];
}

export function WeeklyPriorityEditor({ planId, priorities }: WeeklyPriorityEditorProps) {
  const createPriority = useCreatePriority(planId);
  const updatePriority = useUpdatePriority();
  const deletePriority = useDeletePriority();
  const [newTitle, setNewTitle] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createPriority.mutateAsync({ title: newTitle.trim() });
    setNewTitle("");
  };

  const handleToggleComplete = async (priority: Priority) => {
    await updatePriority.mutateAsync({
      priorityId: priority.id,
      completed: !priority.completed,
    });
  };

  const handleDelete = async (priorityId: string) => {
    if (confirm("Remove this priority?")) {
      await deletePriority.mutateAsync(priorityId);
    }
  };

  const isPending =
    createPriority.isPending || updatePriority.isPending || deletePriority.isPending;

  return (
    <div className="rounded-lg border p-4">
      <h2 className="mb-3 font-medium">Priorities</h2>

      <form onSubmit={handleCreate} className="mb-3 flex items-center gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a priority..."
          maxLength={200}
          className="flex-1 rounded border px-3 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={isPending || !newTitle.trim()}
          className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {priorities.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No priorities yet. Add one above or generate a plan.
        </p>
      ) : (
        <div className="space-y-1">
          {priorities.map((priority) => (
            <div
              key={priority.id}
              className={`flex items-center justify-between rounded border px-3 py-2 text-sm ${
                priority.completed ? "bg-neutral-50 opacity-60" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={priority.completed}
                  onChange={() => handleToggleComplete(priority)}
                  disabled={isPending}
                  className="h-4 w-4 rounded border-neutral-300"
                />
                <span className={priority.completed ? "line-through" : ""}>{priority.title}</span>
                {priority.targetDate && (
                  <span className="text-xs text-neutral-400">
                    by {new Date(priority.targetDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDelete(priority.id)}
                disabled={isPending}
                className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
