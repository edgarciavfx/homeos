"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChoreView, OwnershipView } from "@/types/views/chore.view";

async function fetchChores(householdId: string): Promise<ChoreView[]> {
  const res = await fetch(`/api/v1/households/${householdId}/chores`);
  if (!res.ok) throw new Error("Failed to fetch chores");
  const json = await res.json();
  return json.data;
}

async function fetchOverdueChores(householdId: string) {
  const res = await fetch(`/api/v1/households/${householdId}/chores?status=OVERDUE`);
  if (!res.ok) throw new Error("Failed to fetch overdue chores");
  const json = await res.json();
  return json.data;
}

async function createChore(
  householdId: string,
  data: { name: string; frequency: string; ownerId?: string },
) {
  const res = await fetch(`/api/v1/households/${householdId}/chores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create chore");
  const json = await res.json();
  return json.data;
}

async function updateChore(
  choreId: string,
  data: { name?: string; frequency?: string; active?: boolean },
) {
  const res = await fetch(`/api/v1/chores/${choreId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update chore");
  const json = await res.json();
  return json.data;
}

async function completeChoreOccurrence(occurrenceId: string) {
  const res = await fetch(`/api/v1/chore-occurrences/${occurrenceId}/complete`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to complete chore occurrence");
  const json = await res.json();
  return json.data;
}

async function fetchOwnerships(householdId: string): Promise<OwnershipView[]> {
  const res = await fetch(`/api/v1/households/${householdId}/ownerships`);
  if (!res.ok) throw new Error("Failed to fetch ownerships");
  const json = await res.json();
  return json.data;
}

async function assignOwnership(householdId: string, data: { areaName: string; ownerId: string }) {
  const res = await fetch(`/api/v1/households/${householdId}/ownerships`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to assign ownership");
  const json = await res.json();
  return json.data;
}

export function useChores(householdId: string | null) {
  return useQuery({
    queryKey: ["chores", householdId],
    queryFn: () => fetchChores(householdId!),
    enabled: !!householdId,
  });
}

export function useOverdueChores(householdId: string | null) {
  return useQuery({
    queryKey: ["chores", householdId, "overdue"],
    queryFn: () => fetchOverdueChores(householdId!),
    enabled: !!householdId,
  });
}

export function useCreateChore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      householdId,
      name,
      frequency,
      ownerId,
    }: {
      householdId: string;
      name: string;
      frequency: string;
      ownerId?: string;
    }) => createChore(householdId, { name, frequency, ownerId }),
    onSuccess: (_, { householdId }) => {
      queryClient.invalidateQueries({ queryKey: ["chores", householdId] });
    },
  });
}

export function useUpdateChore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      choreId,
      ...data
    }: {
      choreId: string;
      name?: string;
      frequency?: string;
      active?: boolean;
    }) => updateChore(choreId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chores"] });
    },
  });
}

export function useCompleteChoreOccurrence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (occurrenceId: string) => completeChoreOccurrence(occurrenceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chores"] });
    },
  });
}

export function useOwnerships(householdId: string | null) {
  return useQuery({
    queryKey: ["ownerships", householdId],
    queryFn: () => fetchOwnerships(householdId!),
    enabled: !!householdId,
  });
}

export function useAssignOwnership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      householdId,
      areaName,
      ownerId,
    }: {
      householdId: string;
      areaName: string;
      ownerId: string;
    }) => assignOwnership(householdId, { areaName, ownerId }),
    onSuccess: (_, { householdId }) => {
      queryClient.invalidateQueries({ queryKey: ["ownerships", householdId] });
    },
  });
}
