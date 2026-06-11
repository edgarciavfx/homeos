"use client";

import { useHousehold } from "@/components/household-context-provider";
import { HouseholdSettingsCard } from "@/components/settings/household-settings-card";
import { MemberManagementTable } from "@/components/settings/member-management-table";
import { InvitationManager } from "@/components/settings/invitation-manager";
import { useCreateHousehold } from "@/hooks/use-households";
import { useState } from "react";

function CreateHouseholdForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const createMutation = useCreateHousehold();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createMutation.mutateAsync(name);
    setName("");
    onCreated();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Household name"
        minLength={2}
        maxLength={100}
        required
        className="flex-1 rounded border px-3 py-1.5 text-sm"
      />
      <button
        type="submit"
        disabled={createMutation.isPending || !name.trim()}
        className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        {createMutation.isPending ? "Creating..." : "Create Household"}
      </button>
    </form>
  );
}

export default function SettingsPage() {
  const { householdId, isLoading } = useHousehold();
  const [showCreate, setShowCreate] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-32 animate-pulse rounded bg-neutral-200" />
        <div className="h-40 animate-pulse rounded-lg border bg-neutral-100" />
      </div>
    );
  }

  if (!householdId) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-neutral-500">You are not a member of any household.</p>
        {showCreate ? (
          <CreateHouseholdForm onCreated={() => setShowCreate(false)} />
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            className="rounded bg-neutral-900 px-4 py-2 text-sm text-white"
          >
            Create Household
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-sm text-neutral-500">Household administration</p>
      <div className="space-y-6">
        <HouseholdSettingsCard householdId={householdId} />
        <MemberManagementTable householdId={householdId} />
        <InvitationManager householdId={householdId} />
      </div>
    </div>
  );
}
