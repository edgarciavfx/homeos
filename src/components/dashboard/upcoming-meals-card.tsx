"use client";

import Link from "next/link";
import type { DashboardSummaryView } from "@/application/queries/dashboard/get-dashboard-summary.query";

interface UpcomingMealsCardProps {
  dashboard: DashboardSummaryView;
}

export function UpcomingMealsCard({ dashboard }: UpcomingMealsCardProps) {
  const meals = dashboard.upcomingMeals;

  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-sm font-medium text-neutral-500">Upcoming Meals</h3>
      {meals.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {meals.map((meal, i) => (
            <li key={i} className="flex items-center justify-between text-sm">
              <span>{meal.mealName}</span>
              <span className="text-xs text-neutral-500">
                {new Date(meal.scheduledDate).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-neutral-500">No meals scheduled</p>
      )}
      <Link href="/planning" className="mt-2 inline-block text-xs text-neutral-900 underline">
        Go to Planning
      </Link>
    </div>
  );
}
