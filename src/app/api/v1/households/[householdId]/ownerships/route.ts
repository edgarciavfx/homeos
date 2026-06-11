import { NextRequest } from "next/server";
import { protectedRoute } from "@/lib/api/api-handler";
import { ok, created } from "@/lib/api/api-response";
import { OwnershipRepository } from "@/infrastructure/repositories/ownership.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { AssignOwnershipService } from "@/application/chores/assign-ownership.service";

const assignService = new AssignOwnershipService(
  new OwnershipRepository(),
  new HouseholdMemberRepository(),
);

export const GET = protectedRoute(async (_req, { params }) => {
  const { householdId } = await params;
  const repo = new OwnershipRepository();
  const areas = await repo.findByHousehold(householdId);
  return ok(areas);
});

export const POST = protectedRoute(async (req, { params, userId }) => {
  const { householdId } = await params;
  const body = await req.json();
  const result = await assignService.execute({
    householdId,
    userId,
    areaName: body.areaName,
    ownerId: body.ownerId,
  });
  return created(result);
});
