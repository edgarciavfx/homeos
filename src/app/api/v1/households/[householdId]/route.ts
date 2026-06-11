import { NextRequest } from "next/server";
import { protectedRoute } from "@/lib/api/api-handler";
import { ok } from "@/lib/api/api-response";
import { NotFoundError, ForbiddenError } from "@/lib/api/api-error";
import { HouseholdRepository } from "@/infrastructure/repositories/household.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { RenameHouseholdService } from "@/application/households/rename-household.service";

const renameHouseholdService = new RenameHouseholdService(
  new HouseholdRepository(),
  new HouseholdMemberRepository(),
);

export const GET = protectedRoute(async (_req, { params, userId }) => {
  const { householdId } = await params;
  const repo = new HouseholdRepository();
  const memberRepo = new HouseholdMemberRepository();

  const household = await repo.findById(householdId);
  if (!household) throw new NotFoundError("Household not found");

  const membership = await memberRepo.findByUserAndHousehold(userId, householdId);
  if (!membership) throw new ForbiddenError();

  const memberCount = await memberRepo.countByHousehold(householdId);
  return ok({
    id: household.id,
    name: household.name,
    ownerId: household.ownerId,
    createdAt: household.createdAt,
    memberCount,
  });
});

export const PATCH = protectedRoute(async (req, { params, userId }) => {
  const { householdId } = await params;
  const body = await req.json();
  const result = await renameHouseholdService.execute({
    householdId,
    userId,
    name: body.name,
  });
  return ok(result);
});
