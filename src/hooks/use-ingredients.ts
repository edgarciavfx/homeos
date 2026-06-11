"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IngredientView } from "@/types/views/meal.view";

async function addIngredient(mealId: string, name: string, quantity: number, unit: string): Promise<IngredientView> {
  const res = await fetch(`/api/v1/meals/${mealId}/ingredients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, quantity, unit }),
  });
  if (!res.ok) throw new Error("Failed to add ingredient");
  const json = await res.json();
  return json.data;
}

async function updateIngredient(
  ingredientId: string,
  data: { name?: string; quantity?: number; unit?: string },
): Promise<IngredientView> {
  const res = await fetch(`/api/v1/ingredients/${ingredientId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update ingredient");
  const json = await res.json();
  return json.data;
}

async function deleteIngredient(ingredientId: string) {
  const res = await fetch(`/api/v1/ingredients/${ingredientId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete ingredient");
  const json = await res.json();
  return json.data;
}

export function useAddIngredient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mealId, name, quantity, unit }: { mealId: string; name: string; quantity: number; unit: string }) =>
      addIngredient(mealId, name, quantity, unit),
    onSuccess: (_, { mealId }) => {
      queryClient.invalidateQueries({ queryKey: ["meal", mealId] });
      queryClient.invalidateQueries({ queryKey: ["meals"] });
    },
  });
}

export function useUpdateIngredient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      ingredientId,
      ...data
    }: {
      ingredientId: string;
      name?: string;
      quantity?: number;
      unit?: string;
    }) => updateIngredient(ingredientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal"] });
      queryClient.invalidateQueries({ queryKey: ["meals"] });
    },
  });
}

export function useDeleteIngredient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ingredientId, mealId }: { ingredientId: string; mealId: string }) => deleteIngredient(ingredientId),
    onSuccess: (_, { mealId }) => {
      queryClient.invalidateQueries({ queryKey: ["meal", mealId] });
      queryClient.invalidateQueries({ queryKey: ["meals"] });
    },
  });
}
