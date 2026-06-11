import { NextRequest } from "next/server";
import { protectedRoute } from "@/lib/api/api-handler";
import { ok } from "@/lib/api/api-response";
import { WeeklyPlanRepository } from "@/infrastructure/repositories/weekly-plan.repository";

export const GET = protectedRoute(async (_req, { params }) => {
  const { planId } = await params;
  const repo = new WeeklyPlanRepository();
  const plan = await repo.findById(planId);
  return ok(plan);
});

export const PATCH = protectedRoute(async (req, { params }) => {
  const { planId } = await params;
  const body = await req.json();
  const repo = new WeeklyPlanRepository();
  const plan = await repo.updateStatus(planId, body.status);
  return ok(plan);
});
