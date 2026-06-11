import { NextRequest } from "next/server";
import { protectedRoute } from "@/lib/api/api-handler";
import { ok } from "@/lib/api/api-response";
import { WeeklyPriorityRepository } from "@/infrastructure/repositories/weekly-priority.repository";

export const PATCH = protectedRoute(async (req, { params }) => {
  const { priorityId } = await params;
  const body = await req.json();
  const repo = new WeeklyPriorityRepository();
  const result = await repo.update(priorityId, {
    title: body.title,
    description: body.description,
    ownerId: body.ownerId,
    targetDate: body.targetDate ? new Date(body.targetDate) : undefined,
    completed: body.completed,
    completedAt: body.completed ? new Date() : undefined,
  });
  return ok(result);
});

export const DELETE = protectedRoute(async (_req, { params }) => {
  const { priorityId } = await params;
  const repo = new WeeklyPriorityRepository();
  await repo.delete(priorityId);
  return ok({ deleted: true });
});
