import { NextRequest } from "next/server";
import { protectedRoute } from "@/lib/api/api-handler";
import { created } from "@/lib/api/api-response";
import { MealIngredientRepository } from "@/infrastructure/repositories/meal-ingredient.repository";
import { AddIngredientSchema } from "@/lib/validation/schemas";
import { ValidationError } from "@/lib/api/api-error";

export const POST = protectedRoute(async (req, { params }) => {
  const { mealId } = await params;
  const body = await req.json();

  const parsed = AddIngredientSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0].message);
  }

  const repo = new MealIngredientRepository();
  const ingredient = await repo.create({
    mealId,
    name: body.name,
    quantity: body.quantity,
    unit: body.unit,
  });
  return created(ingredient);
});
