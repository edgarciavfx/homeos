import { NextRequest } from "next/server";
import { protectedRoute } from "@/lib/api/api-handler";
import { ok, created } from "@/lib/api/api-response";
import { HouseholdRepository } from "@/infrastructure/repositories/household.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { CreateHouseholdService } from "@/application/households/create-household.service";

const createHouseholdService = new CreateHouseholdService(
  new HouseholdRepository(),
  new HouseholdMemberRepository(),
);

export const POST = protectedRoute(async (req, { userId }) => {
  const body = await req.json();
  const result = await createHouseholdService.execute({
    userId,
    name: body.name,
  });
  return created(result);
});

export const GET = protectedRoute(async (_req, { userId }) => {
  const repo = new HouseholdRepository();
  const memberships = await repo.findMembership(userId);
  const owned = await repo.findByOwnerId(userId);
  const households = memberships.map((m) => ({
    id: m.household.id,
    name: m.household.name,
    role: m.role,
  }));
  return ok(households);
});
