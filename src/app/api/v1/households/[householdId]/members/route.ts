import { protectedRoute } from "@/lib/api/api-handler";
import { ok } from "@/lib/api/api-response";
import { ForbiddenError } from "@/lib/api/api-error";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";

const memberRepo = new HouseholdMemberRepository();

export const GET = protectedRoute(async (_req, { params, userId }) => {
  const { householdId } = await params;

  const membership = await memberRepo.findByUserAndHousehold(userId, householdId);
  if (!membership) throw new ForbiddenError();

  const members = await memberRepo.findByHousehold(householdId);
  return ok(
    members.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      joinedAt: m.joinedAt,
    })),
  );
});
