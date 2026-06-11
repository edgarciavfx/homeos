"use client";

import { useState } from "react";
import { useInvitations, useInviteMember } from "@/hooks/use-invitations";

interface InvitationManagerProps {
  householdId: string;
}

export function InvitationManager({ householdId }: InvitationManagerProps) {
  const { data: invitations, isLoading } = useInvitations(householdId);
  const inviteMutation = useInviteMember();
  const [email, setEmail] = useState("");

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await inviteMutation.mutateAsync({ householdId, email });
    setEmail("");
  };

  return (
    <div className="rounded-lg border">
      <div className="border-b px-4 py-3">
        <h2 className="font-medium">Invitations</h2>
      </div>

      <form onSubmit={handleInvite} className="flex items-center gap-2 border-b px-4 py-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          required
          className="flex-1 rounded border px-3 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={inviteMutation.isPending || !email}
          className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          {inviteMutation.isPending ? "Sending..." : "Invite"}
        </button>
      </form>

      {isLoading ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-8 animate-pulse rounded bg-neutral-200" />
          ))}
        </div>
      ) : !invitations || invitations.length === 0 ? (
        <p className="p-4 text-sm text-neutral-500">No pending invitations.</p>
      ) : (
        <div className="divide-y">
          {invitations.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span>{inv.email}</span>
              <span className="text-xs text-neutral-400">
                {inv.acceptedAt
                  ? "Accepted"
                  : `Expires ${new Date(inv.expiresAt).toLocaleDateString()}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
