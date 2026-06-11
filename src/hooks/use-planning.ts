"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CurrentWeeklyPlanView } from "@/types/views/planning.view";
import type { MealRecommendationView } from "@/types/views/meal.view";

async function fetchCurrentWeeklyPlan(householdId: string): Promise<CurrentWeeklyPlanView | null> {
  const res = await fetch(`/api/v1/households/${householdId}/weekly-plans`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch weekly plan");
  const json = await res.json();
  return json.data;
}

async function generateWeeklyPlan(householdId: string, weekStartDate: string) {
  const res = await fetch(`/api/v1/households/${householdId}/weekly-plans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ weekStartDate }),
  });
  if (!res.ok) throw new Error("Failed to generate weekly plan");
  const json = await res.json();
  return json.data;
}

async function updatePlanStatus(planId: string, status: string) {
  const res = await fetch(`/api/v1/weekly-plans/${planId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update plan status");
  const json = await res.json();
  return json.data;
}

async function deletePlan(planId: string) {
  const res = await fetch(`/api/v1/weekly-plans/${planId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete plan");
  const json = await res.json();
  return json.data;
}

async function createPriority(
  planId: string,
  data: {
    title: string;
    description?: string;
    ownerId?: string;
    targetDate?: string;
  },
) {
  const res = await fetch(`/api/v1/weekly-plans/${planId}/priorities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create priority");
  const json = await res.json();
  return json.data;
}

async function updatePriority(
  priorityId: string,
  data: {
    title?: string;
    description?: string;
    ownerId?: string;
    targetDate?: string;
    completed?: boolean;
  },
) {
  const res = await fetch(`/api/v1/priorities/${priorityId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update priority");
  const json = await res.json();
  return json.data;
}

async function deletePriority(priorityId: string) {
  const res = await fetch(`/api/v1/priorities/${priorityId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete priority");
  const json = await res.json();
  return json.data;
}

async function scheduleMeal(planId: string, mealId: string, scheduledDate: string) {
  const res = await fetch(`/api/v1/weekly-plans/${planId}/scheduled-meals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mealId, scheduledDate }),
  });
  if (!res.ok) throw new Error("Failed to schedule meal");
  const json = await res.json();
  return json.data;
}

async function unscheduledMeal(scheduledMealId: string) {
  const res = await fetch(`/api/v1/scheduled-meals/${scheduledMealId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove scheduled meal");
  const json = await res.json();
  return json.data;
}

async function fetchMealRecommendations(planId: string): Promise<MealRecommendationView[]> {
  const res = await fetch(`/api/v1/weekly-plans/${planId}/meal-recommendations`);
  if (!res.ok) throw new Error("Failed to fetch meal recommendations");
  const json = await res.json();
  return json.data;
}

async function generateMealRecommendations(planId: string) {
  const res = await fetch(`/api/v1/weekly-plans/${planId}/meal-recommendations`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to generate meal recommendations");
  const json = await res.json();
  return json.data;
}

export function useCurrentWeeklyPlan(householdId: string | null) {
  return useQuery({
    queryKey: ["weekly-plan", householdId],
    queryFn: () => fetchCurrentWeeklyPlan(householdId!),
    enabled: !!householdId,
  });
}

export function useGenerateWeeklyPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ householdId, weekStartDate }: { householdId: string; weekStartDate: string }) =>
      generateWeeklyPlan(householdId, weekStartDate),
    onSuccess: (_, { householdId }) => {
      queryClient.invalidateQueries({ queryKey: ["weekly-plan", householdId] });
    },
  });
}

export function useUpdatePlanStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, status }: { planId: string; status: string }) =>
      updatePlanStatus(planId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly-plan"] });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => deletePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly-plan"] });
    },
  });
}

export function useCreatePriority(planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      ownerId?: string;
      targetDate?: string;
    }) => createPriority(planId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly-plan"] });
    },
  });
}

export function useUpdatePriority() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      priorityId,
      ...data
    }: {
      priorityId: string;
      title?: string;
      description?: string;
      ownerId?: string;
      targetDate?: string;
      completed?: boolean;
    }) => updatePriority(priorityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly-plan"] });
    },
  });
}

export function useDeletePriority() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (priorityId: string) => deletePriority(priorityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly-plan"] });
    },
  });
}

export function useScheduleMeal(planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mealId, scheduledDate }: { mealId: string; scheduledDate: string }) =>
      scheduleMeal(planId, mealId, scheduledDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly-plan"] });
    },
  });
}

export function useUnscheduledMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scheduledMealId: string) => unscheduledMeal(scheduledMealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly-plan"] });
    },
  });
}

export function useMealRecommendations(planId: string | null) {
  return useQuery({
    queryKey: ["meal-recommendations", planId],
    queryFn: () => fetchMealRecommendations(planId!),
    enabled: !!planId,
  });
}

export function useGenerateMealRecommendations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => generateMealRecommendations(planId),
    onSuccess: (_, planId) => {
      queryClient.invalidateQueries({ queryKey: ["meal-recommendations", planId] });
    },
  });
}
