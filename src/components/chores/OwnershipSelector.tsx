"use client";

import { useState } from "react";
import { useOwnerships, useAssignOwnership } from "@/hooks/use-chores";
import { useMembers } from "@/hooks/use-members";

interface OwnershipSelectorProps {
  householdId: string;
}

export function OwnershipSelector({ householdId }: OwnershipSelectorProps) {
  const [showForm, setShowForm] = useState(false);
  const [areaName, setAreaName] = useState("");
  const [ownerId, setOwnerId] = useState("");

  const { data: ownerships, isLoading: ownershipsLoading } = useOwnerships(householdId);
  const { data: members } = useMembers(householdId);
  const assignOwnership = useAssignOwnership();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaName.trim() || !ownerId) return;
    await assignOwnership.mutateAsync({ householdId, areaName: areaName.trim(), ownerId });
    setAreaName("");
    setOwnerId("");
    setShowForm(false);
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-700">Ownership Areas</h3>
        <button
          onClick={() => setShowForm(true)}
          className="rounded border bg-white px-2.5 py-1 text-xs hover:bg-neutral-50"
        >
          Add Area
        </button>
      </div>

      {ownershipsLoading && <div className="h-16 animate-pulse rounded-lg border bg-neutral-100" />}

      {ownerships && ownerships.length > 0 && (
        <div className="space-y-1">
          {ownerships.map((o) => (
            <div key={o.id} className="flex items-center justify-between rounded border px-3 py-2">
              <span className="text-sm">{o.areaName}</span>
              <span className="text-xs text-neutral-500">{o.ownerName ?? "Unassigned"}</span>
            </div>
          ))}
        </div>
      )}

      {ownerships && ownerships.length === 0 && !showForm && (
        <div className="rounded-lg border border-dashed p-4 text-center">
          <p className="text-xs text-neutral-500">No ownership areas defined yet.</p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-3 space-y-2 rounded border p-3">
          <input
            type="text"
            value={areaName}
            onChange={(e) => setAreaName(e.target.value)}
            placeholder="Area name (e.g. Kitchen)"
            className="w-full rounded border px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-neutral-300 focus:outline-none"
            autoFocus
          />
          <select
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            className="w-full rounded border px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-neutral-300 focus:outline-none"
          >
            <option value="">Select owner...</option>
            {members?.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.name ?? m.email}
              </option>
            ))}
          </select>
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded border bg-white px-2.5 py-1 text-xs hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assignOwnership.isPending || !areaName.trim() || !ownerId}
              className="rounded bg-neutral-900 px-2.5 py-1 text-xs text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {assignOwnership.isPending ? "Saving..." : "Assign"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
