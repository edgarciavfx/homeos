import { NextRequest } from "next/server";
import { protectedRoute } from "@/lib/api/api-handler";
import { created } from "@/lib/api/api-response";
import { WeeklyPriorityRepository } from "@/infrastructure/repositories/weekly-priority.repository";
import { CreatePrioritySchema } from "@/lib/validation/schemas";
import { ValidationError } from "@/lib/api/api-error";

export const POST = protectedRoute(async (req, { params }) => {
  const { planId } = await params;
  const body = await req.json();

  const parsed = CreatePrioritySchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0].message);
  }

  const repo = new WeeklyPriorityRepository();
  const priority = await repo.create({
    weeklyPlanId: planId,
    title: body.title,
    description: body.description,
    ownerId: body.ownerId,
    targetDate: body.targetDate ? new Date(body.targetDate) : undefined,
  });
  return created(priority);
});
