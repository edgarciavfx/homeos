"use client";

import { useQuery } from "@tanstack/react-query";
import type { HouseholdMemberView } from "@/types/views/household.view";

async function fetchMembers(householdId: string): Promise<HouseholdMemberView[]> {
  const res = await fetch(`/api/v1/households/${householdId}/members`);
  if (!res.ok) throw new Error("Failed to fetch members");
  const json = await res.json();
  return json.data;
}

export function useMembers(householdId: string | null) {
  return useQuery({
    queryKey: ["members", householdId],
    queryFn: () => fetchMembers(householdId!),
    enabled: !!householdId,
  });
}
