import { NextRequest } from "next/server";
import { protectedRoute } from "@/lib/api/api-handler";
import { ok, created } from "@/lib/api/api-response";
import { ChoreRepository } from "@/infrastructure/repositories/chore.repository";
import { ChoreOccurrenceRepository } from "@/infrastructure/repositories/chore-occurrence.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { CreateChoreService } from "@/application/chores/create-chore.service";

const createChoreService = new CreateChoreService(
  new ChoreRepository(),
  new ChoreOccurrenceRepository(),
  new HouseholdMemberRepository(),
);

export const GET = protectedRoute(async (req, { params }) => {
  const { householdId } = await params;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  if (status === "OVERDUE") {
    const { ChoreOccurrenceRepository } = await import("@/infrastructure/repositories/chore-occurrence.repository");
    const repo = new ChoreOccurrenceRepository();
    const overdue = await repo.findOverdue(householdId);
    return ok(overdue);
  }

  const repo = new ChoreRepository();
  const chores = await repo.findByHousehold(householdId);
  return ok(chores);
});

export const POST = protectedRoute(async (req, { params, userId }) => {
  const { householdId } = await params;
  const body = await req.json();
  const result = await createChoreService.execute({
    householdId,
    userId,
    name: body.name,
    frequency: body.frequency,
    ownerId: body.ownerId,
  });
  return created(result);
});
