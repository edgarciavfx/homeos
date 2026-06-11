import { NextRequest } from "next/server";
import { protectedRoute } from "@/lib/api/api-handler";
import { ok } from "@/lib/api/api-response";
import { ChoreRepository } from "@/infrastructure/repositories/chore.repository";

export const PATCH = protectedRoute(async (req, { params }) => {
  const { choreId } = await params;
  const body = await req.json();
  const repo = new ChoreRepository();
  const result = await repo.update(choreId, {
    name: body.name,
    frequency: body.frequency,
    active: body.active,
  });
  return ok(result);
});
