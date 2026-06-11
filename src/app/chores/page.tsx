"use client";

import { useHousehold } from "@/components/household-context-provider";
import { ChoreList } from "@/components/chores/ChoreList";
import { ChoreOccurrenceTable } from "@/components/chores/ChoreOccurrenceTable";
import { OwnershipSelector } from "@/components/chores/OwnershipSelector";
import Link from "next/link";

export default function ChoresPage() {
  const { householdId, isLoading } = useHousehold();

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-32 animate-pulse rounded bg-neutral-200" />
        <div className="h-48 animate-pulse rounded-lg border bg-neutral-100" />
      </div>
    );
  }

  if (!householdId) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Chores</h1>
        <p className="text-sm text-neutral-500">
          You need to be part of a household to manage chores.{" "}
          <Link href="/settings" className="underline">
            Create or join a household
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold">Chores</h1>
        <p className="text-sm text-neutral-500">Track recurring household responsibilities</p>
      </div>

      <ChoreOccurrenceTable householdId={householdId} />

      <ChoreList householdId={householdId} />

      <OwnershipSelector householdId={householdId} />
    </div>
  );
}
