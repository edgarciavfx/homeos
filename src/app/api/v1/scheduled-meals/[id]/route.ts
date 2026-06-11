import { NextRequest } from "next/server";
import { protectedRoute } from "@/lib/api/api-handler";
import { ok } from "@/lib/api/api-response";
import { ScheduledMealRepository } from "@/infrastructure/repositories/scheduled-meal.repository";

export const PATCH = protectedRoute(async (req, { params }) => {
  const { id } = await params;
  const body = await req.json();
  const repo = new ScheduledMealRepository();
  const result = await repo.update(id, {
    scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : undefined,
    mealId: body.mealId,
  });
  return ok(result);
});

export const DELETE = protectedRoute(async (_req, { params }) => {
  const { id } = await params;
  const repo = new ScheduledMealRepository();
  await repo.delete(id);
  return ok({ deleted: true });
});
