"use client";

import { useState } from "react";
import { useCreateMeal, useUpdateMeal } from "@/hooks/use-meals";

interface MealFormProps {
  householdId: string;
  initialValues?: { mealId: string; name: string; preparationMinutes: number };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MealForm({ householdId, initialValues, onSuccess, onCancel }: MealFormProps) {
  const createMeal = useCreateMeal();
  const updateMeal = useUpdateMeal();
  const [name, setName] = useState(initialValues?.name ?? "");
  const [preparationMinutes, setPreparationMinutes] = useState(
    initialValues?.preparationMinutes ?? 30,
  );

  const isPending = initialValues ? updateMeal.isPending : createMeal.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (initialValues) {
      await updateMeal.mutateAsync({
        mealId: initialValues.mealId,
        name: name.trim(),
        preparationMinutes,
      });
    } else {
      await createMeal.mutateAsync({
        householdId,
        name: name.trim(),
        preparationMinutes,
      });
    }

    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          Meal Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Spaghetti Bolognese"
          minLength={1}
          maxLength={150}
          required
          className="w-full rounded border px-3 py-1.5 text-sm"
        />
      </div>

      <div>
        <label htmlFor="prep-time" className="mb-1 block text-sm font-medium">
          Preparation Time (minutes)
        </label>
        <input
          id="prep-time"
          type="number"
          value={preparationMinutes}
          onChange={(e) => setPreparationMinutes(Number(e.target.value))}
          min={1}
          max={1440}
          required
          className="w-full rounded border px-3 py-1.5 text-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="rounded bg-neutral-900 px-4 py-1.5 text-sm text-white disabled:opacity-50"
        >
          {isPending ? "Saving..." : initialValues ? "Update Meal" : "Create Meal"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded border px-4 py-1.5 text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
