"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { InvitationView, InviteMemberResponse } from "@/types/views/household.view";

async function fetchInvitations(householdId: string): Promise<InvitationView[]> {
  const res = await fetch(`/api/v1/households/${householdId}/invitations`);
  if (!res.ok) throw new Error("Failed to fetch invitations");
  const json = await res.json();
  return json.data;
}

async function inviteMember(householdId: string, email: string): Promise<InviteMemberResponse> {
  const res = await fetch(`/api/v1/households/${householdId}/invitations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Failed to invite member");
  const json = await res.json();
  return json.data;
}

async function acceptInvitation(token: string) {
  const res = await fetch(`/api/v1/invitations/${token}/accept`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to accept invitation");
  const json = await res.json();
  return json.data;
}

export function useInvitations(householdId: string | null) {
  return useQuery({
    queryKey: ["invitations", householdId],
    queryFn: () => fetchInvitations(householdId!),
    enabled: !!householdId,
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ householdId, email }: { householdId: string; email: string }) =>
      inviteMember(householdId, email),
    onSuccess: (_, { householdId }) => {
      queryClient.invalidateQueries({ queryKey: ["invitations", householdId] });
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => acceptInvitation(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["households"] });
    },
  });
}
