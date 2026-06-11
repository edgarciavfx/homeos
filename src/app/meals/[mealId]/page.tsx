"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useMeal } from "@/hooks/use-meals";
import { useHousehold } from "@/components/household-context-provider";
import { MealForm } from "@/components/meals/meal-form";
import { IngredientEditor } from "@/components/meals/ingredient-editor";

export default function EditMealPage({ params }: { params: Promise<{ mealId: string }> }) {
  const { mealId } = use(params);
  const router = useRouter();
  const { householdId } = useHousehold();
  const { data: meal, isLoading, error } = useMeal(mealId);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-40 animate-pulse rounded bg-neutral-200" />
        <div className="h-48 animate-pulse rounded-lg border bg-neutral-100" />
        <div className="h-32 animate-pulse rounded-lg border bg-neutral-100" />
      </div>
    );
  }

  if (error || !meal) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Meal not found</h1>
        <p className="text-sm text-neutral-500">This meal does not exist or has been archived.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">{meal.name}</h1>
        <p className="text-sm text-neutral-500">Edit meal details and ingredients</p>
      </div>

      <div className="max-w-md rounded-lg border p-6">
        <MealForm
          householdId={householdId ?? ""}
          initialValues={{
            mealId: meal.id,
            name: meal.name,
            preparationMinutes: meal.preparationMinutes,
          }}
          onSuccess={() => router.refresh()}
          onCancel={() => router.push("/meals")}
        />
      </div>

      <div className="max-w-lg rounded-lg border p-6">
        <IngredientEditor mealId={meal.id} ingredients={meal.ingredients} />
      </div>
    </div>
  );
}
