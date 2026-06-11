"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useBudget(householdId: string | null) {
  return useQuery({
    queryKey: ["budget", householdId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/households/${householdId}/budgets`);
      if (!res.ok) throw new Error("Failed to fetch budget");
      const json = await res.json();
      return json.data;
    },
    enabled: !!householdId,
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      householdId,
      month,
      year,
      amount,
    }: {
      householdId: string;
      month: number;
      year: number;
      amount: number;
    }) => {
      const res = await fetch(`/api/v1/households/${householdId}/budgets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year, amount }),
      });
      if (!res.ok) throw new Error("Failed to create budget");
      return (await res.json()).data;
    },
    onSuccess: (_, { householdId }) => {
      qc.invalidateQueries({ queryKey: ["budget", householdId] });
    },
  });
}

export function usePurchases(budgetId: string | null) {
  return useQuery({
    queryKey: ["purchases", budgetId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/budgets/${budgetId}/purchases`);
      if (!res.ok) throw new Error("Failed to fetch purchases");
      return (await res.json()).data;
    },
    enabled: !!budgetId,
  });
}

export function useRecordPurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      budgetId,
      amount,
      purchaseDate,
      notes,
    }: {
      budgetId: string;
      amount: number;
      purchaseDate: string;
      notes?: string;
    }) => {
      const res = await fetch(`/api/v1/budgets/${budgetId}/purchases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, purchaseDate, notes }),
      });
      if (!res.ok) throw new Error("Failed to record purchase");
      return (await res.json()).data;
    },
    onSuccess: (_, { budgetId }) => {
      qc.invalidateQueries({ queryKey: ["purchases", budgetId] });
      qc.invalidateQueries({ queryKey: ["budget"] });
    },
  });
}
