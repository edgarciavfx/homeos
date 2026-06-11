"use client";

import Link from "next/link";
import { useMealLibrary, useArchiveMeal } from "@/hooks/use-meals";

interface MealLibraryTableProps {
  householdId: string;
}

export function MealLibraryTable({ householdId }: MealLibraryTableProps) {
  const { data, isLoading } = useMealLibrary(householdId, { archived: false });
  const archiveMeal = useArchiveMeal();

  const handleArchive = async (mealId: string) => {
    if (confirm("Archive this meal? It can still be viewed but won't appear in recommendations.")) {
      await archiveMeal.mutateAsync(mealId);
    }
  };

  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="font-medium">Meal Library</h2>
        <Link
          href="/meals/create"
          className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white"
        >
          New Meal
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-neutral-200" />
          ))}
        </div>
      ) : !data || data.meals.length === 0 ? (
        <div className="p-4 text-center">
          <p className="text-sm text-neutral-500">No meals yet.</p>
          <Link
            href="/meals/create"
            className="mt-2 inline-block text-sm text-neutral-900 underline"
          >
            Create your first meal
          </Link>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-neutral-500">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Prep Time</th>
              <th className="px-4 py-2 font-medium">Ingredients</th>
              <th className="px-4 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.meals.map((meal) => (
              <tr key={meal.id} className="border-b last:border-0">
                <td className="px-4 py-2 font-medium">{meal.name}</td>
                <td className="px-4 py-2 text-neutral-600">
                  {meal.preparationMinutes} min
                </td>
                <td className="px-4 py-2 text-neutral-600">
                  {meal.ingredients.length} ingredient{meal.ingredients.length !== 1 ? "s" : ""}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/meals/${meal.id}`}
                      className="text-sm text-neutral-600 hover:text-neutral-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleArchive(meal.id)}
                      disabled={archiveMeal.isPending}
                      className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      Archive
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {data && data.total > data.pageSize && (
        <div className="border-t px-4 py-3 text-xs text-neutral-500">
          Showing {data.meals.length} of {data.total} meals
        </div>
      )}
    </div>
  );
}
