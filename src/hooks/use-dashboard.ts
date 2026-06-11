"use client";

import { useQuery } from "@tanstack/react-query";

export function useDashboardSummary(householdId: string | null) {
  return useQuery({
    queryKey: ["dashboard", householdId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/households/${householdId}/dashboard`);
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return (await res.json()).data;
    },
    enabled: !!householdId,
  });
}
