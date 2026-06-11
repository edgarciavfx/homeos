import { protectedRoute } from "@/lib/api/api-handler";
import { ok } from "@/lib/api/api-response";
import { ChoreOccurrenceRepository } from "@/infrastructure/repositories/chore-occurrence.repository";
import { ChoreRepository } from "@/infrastructure/repositories/chore.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { CompleteChoreOccurrenceService } from "@/application/chores/complete-chore-occurrence.service";

const service = new CompleteChoreOccurrenceService(
  new ChoreOccurrenceRepository(),
  new ChoreRepository(),
  new HouseholdMemberRepository(),
);

export const POST = protectedRoute(async (_req, { params, userId }) => {
  const { occurrenceId } = await params;
  const result = await service.execute({ occurrenceId, userId });
  return ok(result);
});
