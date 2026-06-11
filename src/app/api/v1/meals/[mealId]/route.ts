import { NextRequest } from "next/server";
import { protectedRoute } from "@/lib/api/api-handler";
import { ok } from "@/lib/api/api-response";
import { MealRepository } from "@/infrastructure/repositories/meal.repository";

export const PATCH = protectedRoute(async (req, { params }) => {
  const { mealId } = await params;
  const body = await req.json();
  const repo = new MealRepository();
  const result = await repo.update(mealId, {
    name: body.name,
    preparationMinutes: body.preparationMinutes,
  });
  return ok(result);
});

export const DELETE = protectedRoute(async (_req, { params }) => {
  const { mealId } = await params;
  const repo = new MealRepository();
  await repo.archive(mealId);
  return ok({ archived: true });
});
