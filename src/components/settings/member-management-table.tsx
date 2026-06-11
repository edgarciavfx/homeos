"use client";

import { useMembers } from "@/hooks/use-members";

interface MemberManagementTableProps {
  householdId: string;
}

export function MemberManagementTable({ householdId }: MemberManagementTableProps) {
  const { data: members, isLoading } = useMembers(householdId);

  return (
    <div className="rounded-lg border">
      <div className="border-b px-4 py-3">
        <h2 className="font-medium">Members</h2>
      </div>
      {isLoading ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-neutral-200" />
          ))}
        </div>
      ) : !members || members.length === 0 ? (
        <p className="p-4 text-sm text-neutral-500">No members found.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-neutral-500">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b last:border-0">
                <td className="px-4 py-2">{member.name ?? "—"}</td>
                <td className="px-4 py-2 text-neutral-600">{member.email}</td>
                <td className="px-4 py-2">
                  <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium">
                    {member.role}
                  </span>
                </td>
                <td className="px-4 py-2 text-neutral-500">
                  {new Date(member.joinedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
