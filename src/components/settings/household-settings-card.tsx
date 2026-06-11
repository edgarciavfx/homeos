"use client";

import { useState } from "react";
import { useHousehold, useRenameHousehold } from "@/hooks/use-households";

interface HouseholdSettingsCardProps {
  householdId: string;
}

export function HouseholdSettingsCard({ householdId }: HouseholdSettingsCardProps) {
  const { data: household, isLoading } = useHousehold(householdId);
  const renameMutation = useRenameHousehold();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");

  if (isLoading) {
    return (
      <div className="rounded-lg border p-4">
        <div className="h-5 w-32 animate-pulse rounded bg-neutral-200" />
      </div>
    );
  }

  if (!household) return null;

  const handleSave = async () => {
    await renameMutation.mutateAsync({ id: householdId, name });
    setIsEditing(false);
  };

  return (
    <div className="rounded-lg border p-4">
      <h2 className="mb-2 font-medium">Household</h2>
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded border px-3 py-1.5 text-sm"
            autoFocus
          />
          <button
            onClick={handleSave}
            disabled={renameMutation.isPending}
            className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="rounded border px-3 py-1.5 text-sm"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{household.name}</p>
            <p className="text-xs text-neutral-500">
              {household.memberCount} member{household.memberCount !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => {
              setName(household.name);
              setIsEditing(true);
            }}
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            Rename
          </button>
        </div>
      )}
    </div>
  );
}
