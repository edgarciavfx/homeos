import { NextRequest } from "next/server";
import { protectedRoute } from "@/lib/api/api-handler";
import { ok } from "@/lib/api/api-response";
import { MealIngredientRepository } from "@/infrastructure/repositories/meal-ingredient.repository";

export const PATCH = protectedRoute(async (req, { params }) => {
  const { ingredientId } = await params;
  const body = await req.json();
  const repo = new MealIngredientRepository();
  const result = await repo.update(ingredientId, {
    name: body.name,
    quantity: body.quantity,
    unit: body.unit,
  });
  return ok(result);
});

export const DELETE = protectedRoute(async (_req, { params }) => {
  const { ingredientId } = await params;
  const repo = new MealIngredientRepository();
  await repo.delete(ingredientId);
  return ok({ deleted: true });
});
