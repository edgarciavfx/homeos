import { NextRequest } from "next/server";
import { protectedRoute } from "@/lib/api/api-handler";
import { created } from "@/lib/api/api-response";
import { InvitationRepository } from "@/infrastructure/repositories/invitation.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { NoopEmailProvider } from "@/infrastructure/email/email-provider";
import { InviteMemberService } from "@/application/households/invite-member.service";

const inviteMemberService = new InviteMemberService(
  new HouseholdMemberRepository(),
  new InvitationRepository(),
  new NoopEmailProvider(),
);

export const POST = protectedRoute(async (req, { params, userId }) => {
  const { householdId } = await params;
  const body = await req.json();
  const result = await inviteMemberService.execute({
    householdId,
    invitedByUserId: userId,
    email: body.email,
  });
  return created(result);
});
