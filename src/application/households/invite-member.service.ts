import crypto from "crypto";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { InvitationRepository } from "@/infrastructure/repositories/invitation.repository";
import { EmailProvider } from "@/infrastructure/email/email-provider";
import { transaction } from "@/infrastructure/prisma/transaction-manager";
import { InviteMemberSchema } from "@/lib/validation/schemas";
import { INVITATION_EXPIRATION_DAYS } from "@/lib/constants";
import { ValidationError, ForbiddenError, ConflictError } from "@/lib/api/api-error";
import { authorize } from "@/lib/permissions/authorize";
import { Permission } from "@/lib/permissions/permission.enum";
import { HouseholdRole } from "@prisma/client";

export interface InviteMemberInput {
  householdId: string;
  invitedByUserId: string;
  email: string;
}

export interface InviteMemberOutput {
  invitationId: string;
  email: string;
  expiresAt: Date;
}

export class InviteMemberService {
  constructor(
    private memberRepository: HouseholdMemberRepository,
    private invitationRepository: InvitationRepository,
    private emailProvider: EmailProvider,
  ) {}

  async execute(input: InviteMemberInput): Promise<InviteMemberOutput> {
    const parsed = InviteMemberSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0].message);
    }

    const membership = await this.memberRepository.findByUserAndHousehold(
      input.invitedByUserId,
      input.householdId,
    );
    if (!membership) throw new ForbiddenError();

    authorize(membership.role as HouseholdRole, Permission.MEMBER_INVITE);

    const existingMember = await this.memberRepository.findByHouseholdAndEmail(
      input.householdId,
      input.email,
    );
    if (existingMember) {
      throw new ConflictError("User is already a member");
    }

    const activeInvite = await this.invitationRepository.findActiveByEmail(
      input.householdId,
      input.email,
    );
    if (activeInvite) {
      throw new ConflictError("Active invitation already exists");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRATION_DAYS);

    return transaction(async (tx) => {
      const invitation = await this.invitationRepository.create(
        {
          householdId: input.householdId,
          email: input.email,
          token,
          expiresAt,
        },
        tx,
      );

      return invitation;
    }).then(async (invitation) => {
      await this.emailProvider.sendInviteEmail({
        to: input.email,
        householdName: "Household",
        inviteUrl: `${process.env.AUTH_URL}/invitations/${token}/accept`,
      });

      return {
        invitationId: invitation.id,
        email: invitation.email,
        expiresAt: invitation.expiresAt,
      };
    });
  }
}
