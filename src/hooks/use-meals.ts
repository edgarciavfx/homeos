"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { MealDetailView, MealLibraryResult } from "@/types/views/meal.view";

async function fetchMealLibrary(
  householdId: string,
  options?: { archived?: boolean; page?: number; pageSize?: number },
): Promise<MealLibraryResult> {
  const params = new URLSearchParams();
  if (options?.archived !== undefined) params.set("archived", String(options.archived));
  if (options?.page) params.set("page", String(options.page));
  if (options?.pageSize) params.set("pageSize", String(options.pageSize));
  const qs = params.toString();
  const res = await fetch(`/api/v1/households/${householdId}/meals${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch meals");
  const json = await res.json();
  return json.data;
}

async function fetchMeal(mealId: string): Promise<MealDetailView> {
  const res = await fetch(`/api/v1/meals/${mealId}`);
  if (!res.ok) throw new Error("Failed to fetch meal");
  const json = await res.json();
  return json.data;
}

async function createMeal(householdId: string, name: string, preparationMinutes: number) {
  const res = await fetch(`/api/v1/households/${householdId}/meals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, preparationMinutes }),
  });
  if (!res.ok) throw new Error("Failed to create meal");
  const json = await res.json();
  return json.data;
}

async function updateMeal(mealId: string, data: { name?: string; preparationMinutes?: number }) {
  const res = await fetch(`/api/v1/meals/${mealId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update meal");
  const json = await res.json();
  return json.data;
}

async function archiveMeal(mealId: string) {
  const res = await fetch(`/api/v1/meals/${mealId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to archive meal");
  const json = await res.json();
  return json.data;
}

export function useMealLibrary(
  householdId: string | null,
  options?: { archived?: boolean; page?: number; pageSize?: number },
) {
  return useQuery({
    queryKey: ["meals", householdId, options?.archived, options?.page, options?.pageSize],
    queryFn: () => fetchMealLibrary(householdId!, options),
    enabled: !!householdId,
  });
}

export function useMeal(mealId: string | null) {
  return useQuery({
    queryKey: ["meal", mealId],
    queryFn: () => fetchMeal(mealId!),
    enabled: !!mealId,
  });
}

export function useCreateMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ householdId, name, preparationMinutes }: { householdId: string; name: string; preparationMinutes: number }) =>
      createMeal(householdId, name, preparationMinutes),
    onSuccess: (_, { householdId }) => {
      queryClient.invalidateQueries({ queryKey: ["meals", householdId] });
    },
  });
}

export function useUpdateMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mealId, ...data }: { mealId: string; name?: string; preparationMinutes?: number }) =>
      updateMeal(mealId, data),
    onSuccess: (_, { mealId }) => {
      queryClient.invalidateQueries({ queryKey: ["meal", mealId] });
      queryClient.invalidateQueries({ queryKey: ["meals"] });
    },
  });
}

export function useArchiveMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mealId: string) => archiveMeal(mealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
    },
  });
}
