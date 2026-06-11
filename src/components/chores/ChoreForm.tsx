"use client";

import { useState } from "react";
import { useCreateChore } from "@/hooks/use-chores";

interface ChoreFormProps {
  householdId: string;
  onClose: () => void;
}

const FREQUENCIES = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "BIWEEKLY", label: "Biweekly" },
  { value: "MONTHLY", label: "Monthly" },
] as const;

export function ChoreForm({ householdId, onClose }: ChoreFormProps) {
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("WEEKLY");

  const createChore = useCreateChore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createChore.mutateAsync({ householdId, name: name.trim(), frequency });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">New Chore</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Take out trash"
              className="w-full rounded border px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-300 focus:outline-none"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-300 focus:outline-none"
            >
              {FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={createChore.isPending}
              className="rounded border bg-white px-4 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createChore.isPending || !name.trim()}
              className="rounded bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {createChore.isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
