"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { GroceryListView } from "@/types/views/grocery.view";

async function fetchCurrentGroceryList(householdId: string): Promise<GroceryListView | null> {
  const res = await fetch(`/api/v1/households/${householdId}/grocery-list`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch grocery list");
  const json = await res.json();
  return json.data;
}

async function generateGroceryList(weeklyPlanId: string) {
  const res = await fetch(`/api/v1/weekly-plans/${weeklyPlanId}/grocery-list`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to generate grocery list");
  const json = await res.json();
  return json.data;
}

async function addGroceryItem(
  groceryListId: string,
  name: string,
  quantity?: number,
  category?: string,
) {
  const res = await fetch(`/api/v1/grocery-lists/${groceryListId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, quantity, category }),
  });
  if (!res.ok) throw new Error("Failed to add item");
  const json = await res.json();
  return json.data;
}

async function updateGroceryItem(
  itemId: string,
  data: { name?: string; quantity?: number; completed?: boolean },
) {
  const res = await fetch(`/api/v1/grocery-items/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update item");
  const json = await res.json();
  return json.data;
}

async function deleteGroceryItem(itemId: string) {
  const res = await fetch(`/api/v1/grocery-items/${itemId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete item");
  const json = await res.json();
  return json.data;
}

export function useCurrentGroceryList(householdId: string | null) {
  return useQuery({
    queryKey: ["grocery-list", householdId],
    queryFn: () => fetchCurrentGroceryList(householdId!),
    enabled: !!householdId,
  });
}

export function useGenerateGroceryList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (weeklyPlanId: string) => generateGroceryList(weeklyPlanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grocery-list"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-plan"] });
    },
  });
}

export function useAddGroceryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      groceryListId,
      name,
      quantity,
      category,
    }: {
      groceryListId: string;
      name: string;
      quantity?: number;
      category?: string;
    }) => addGroceryItem(groceryListId, name, quantity, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grocery-list"] });
    },
  });
}

export function useUpdateGroceryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      ...data
    }: {
      itemId: string;
      name?: string;
      quantity?: number;
      completed?: boolean;
    }) => updateGroceryItem(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grocery-list"] });
    },
  });
}

export function useDeleteGroceryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => deleteGroceryItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grocery-list"] });
    },
  });
}
