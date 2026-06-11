"use client";

import Link from "next/link";
import type { DashboardSummaryView } from "@/application/queries/dashboard/get-dashboard-summary.query";

interface OverdueChoresCardProps {
  dashboard: DashboardSummaryView;
}

export function OverdueChoresCard({ dashboard }: OverdueChoresCardProps) {
  const chores = dashboard.overdueChores;

  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-sm font-medium text-neutral-500">Overdue Chores</h3>
      {chores.length > 0 ? (
        <div className="mt-2">
          <p className="text-2xl font-bold text-red-600">{chores.length}</p>
          <ul className="mt-1 space-y-0.5">
            {chores.slice(0, 3).map((c) => (
              <li key={c.occurrenceId} className="text-sm text-neutral-600">
                {c.choreName}
              </li>
            ))}
            {chores.length > 3 && (
              <li className="text-xs text-neutral-500">+{chores.length - 3} more</li>
            )}
          </ul>
        </div>
      ) : (
        <p className="mt-2 text-sm text-neutral-500">No overdue chores</p>
      )}
      <Link href="/chores" className="mt-2 inline-block text-xs text-neutral-900 underline">
        View Chores
      </Link>
    </div>
  );
}
