import { NextRequest } from "next/server";
import { protectedRoute } from "@/lib/api/api-handler";
import { ok } from "@/lib/api/api-response";
import { NotFoundError } from "@/lib/api/api-error";
import { MealRepository } from "@/infrastructure/repositories/meal.repository";
import { UpdateMealService } from "@/application/meals/update-meal.service";
import { ArchiveMealService } from "@/application/meals/archive-meal.service";

const updateMealService = new UpdateMealService(new MealRepository());
const archiveMealService = new ArchiveMealService(new MealRepository());

export const GET = protectedRoute(async (_req, { params }) => {
  const { mealId } = await params;
  const repo = new MealRepository();
  const meal = await repo.findById(mealId);
  if (!meal) {
    throw new NotFoundError("Meal not found");
  }
  return ok(meal);
});

export const PATCH = protectedRoute(async (req, { params }) => {
  const { mealId } = await params;
  const body = await req.json();
  const result = await updateMealService.execute({
    mealId,
    name: body.name,
    preparationMinutes: body.preparationMinutes,
  });
  return ok(result);
});

export const DELETE = protectedRoute(async (_req, { params }) => {
  const { mealId } = await params;
  const result = await archiveMealService.execute(mealId);
  return ok(result);
});
