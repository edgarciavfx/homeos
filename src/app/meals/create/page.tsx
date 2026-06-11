"use client";

import { useRouter } from "next/navigation";
import { useHousehold } from "@/components/household-context-provider";
import { MealForm } from "@/components/meals/meal-form";
import Link from "next/link";

export default function CreateMealPage() {
  const router = useRouter();
  const { householdId, isLoading } = useHousehold();

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-40 animate-pulse rounded bg-neutral-200" />
        <div className="h-48 animate-pulse rounded-lg border bg-neutral-100" />
      </div>
    );
  }

  if (!householdId) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Create Meal</h1>
        <p className="text-sm text-neutral-500">
          You need to be part of a household to create meals.{" "}
          <Link href="/settings" className="underline">
            Create or join a household
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Create Meal</h1>
        <p className="text-sm text-neutral-500">Add a new meal to your catalog</p>
      </div>
      <div className="max-w-md rounded-lg border p-6">
        <MealForm
          householdId={householdId}
          onSuccess={() => router.push("/meals")}
          onCancel={() => router.push("/meals")}
        />
      </div>
    </div>
  );
}
