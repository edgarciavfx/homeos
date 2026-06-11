"use client";

import Link from "next/link";
import { useMealLibrary } from "@/hooks/use-meals";

interface MealPickerDialogProps {
  householdId: string;
  onSelect: (mealId: string) => void;
  onClose: () => void;
}

export function MealPickerDialog({ householdId, onSelect, onClose }: MealPickerDialogProps) {
  const { data, isLoading } = useMealLibrary(householdId, { archived: false });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-medium">Select a Meal</h3>
          <button onClick={onClose} className="text-sm text-neutral-500 hover:text-neutral-900">
            Close
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-neutral-200" />
            ))}
          </div>
        ) : !data || data.meals.length === 0 ? (
          <p className="py-4 text-center text-sm text-neutral-500">
            No meals found.{" "}
            <Link href="/meals/create" className="underline">
              Create one
            </Link>
          </p>
        ) : (
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {data.meals.map((meal) => (
              <button
                key={meal.id}
                onClick={() => onSelect(meal.id)}
                className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm hover:bg-neutral-100"
              >
                <span>{meal.name}</span>
                <span className="text-xs text-neutral-400">
                  {meal.preparationMinutes} min · {meal.ingredients.length} ingredients
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
