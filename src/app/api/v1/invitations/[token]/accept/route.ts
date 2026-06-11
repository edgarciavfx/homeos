import { protectedRoute } from "@/lib/api/api-handler";
import { ok } from "@/lib/api/api-response";
import { InvitationRepository } from "@/infrastructure/repositories/invitation.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { AcceptInvitationService } from "@/application/households/accept-invitation.service";

const acceptInvitationService = new AcceptInvitationService(
  new InvitationRepository(),
  new HouseholdMemberRepository(),
);

export const POST = protectedRoute(async (_req, { params, userId }) => {
  const { token } = await params;
  const result = await acceptInvitationService.execute({ token, userId });
  return ok(result);
});
