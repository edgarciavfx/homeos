import { NextRequest } from "next/server";
import { protectedRoute } from "@/lib/api/api-handler";
import { ok, created } from "@/lib/api/api-response";
import { ForbiddenError } from "@/lib/api/api-error";
import { InvitationRepository } from "@/infrastructure/repositories/invitation.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { NoopEmailProvider } from "@/infrastructure/email/email-provider";
import { InviteMemberService } from "@/application/households/invite-member.service";

const inviteMemberService = new InviteMemberService(
  new HouseholdMemberRepository(),
  new InvitationRepository(),
  new NoopEmailProvider(),
);

const memberRepo = new HouseholdMemberRepository();
const invitationRepo = new InvitationRepository();

export const GET = protectedRoute(async (_req, { params, userId }) => {
  const { householdId } = await params;

  const membership = await memberRepo.findByUserAndHousehold(userId, householdId);
  if (!membership) throw new ForbiddenError();

  const invitations = await invitationRepo.findByHousehold(householdId);
  return ok(invitations);
});

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
