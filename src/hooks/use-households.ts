"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { HouseholdWithRoleView, HouseholdDetailView, CreateHouseholdResponse } from "@/types/views/household.view";

async function fetchHouseholds(): Promise<HouseholdWithRoleView[]> {
  const res = await fetch("/api/v1/households");
  if (!res.ok) throw new Error("Failed to fetch households");
  const json = await res.json();
  return json.data;
}

async function fetchHousehold(id: string): Promise<HouseholdDetailView> {
  const res = await fetch(`/api/v1/households/${id}`);
  if (!res.ok) throw new Error("Failed to fetch household");
  const json = await res.json();
  return json.data;
}

async function createHousehold(name: string): Promise<CreateHouseholdResponse> {
  const res = await fetch("/api/v1/households", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to create household");
  const json = await res.json();
  return json.data;
}

async function renameHousehold(id: string, name: string) {
  const res = await fetch(`/api/v1/households/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to rename household");
  const json = await res.json();
  return json.data;
}

export function useHouseholds() {
  return useQuery({
    queryKey: ["households"],
    queryFn: fetchHouseholds,
  });
}

export function useHousehold(id: string | null) {
  return useQuery({
    queryKey: ["household", id],
    queryFn: () => fetchHousehold(id!),
    enabled: !!id,
  });
}

export function useCreateHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createHousehold(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["households"] });
    },
  });
}

export function useRenameHousehold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameHousehold(id, name),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["households"] });
      queryClient.invalidateQueries({ queryKey: ["household", id] });
    },
  });
}
