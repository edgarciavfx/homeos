import { InvitationRepository } from "@/infrastructure/repositories/invitation.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { transaction } from "@/infrastructure/prisma/transaction-manager";
import { NotFoundError, ConflictError } from "@/lib/api/api-error";

export interface AcceptInvitationInput {
  token: string;
  userId: string;
}

export interface AcceptInvitationOutput {
  householdId: string;
  role: string;
}

export class AcceptInvitationService {
  constructor(
    private invitationRepository: InvitationRepository,
    private memberRepository: HouseholdMemberRepository,
  ) {}

  async execute(input: AcceptInvitationInput): Promise<AcceptInvitationOutput> {
    const invitation = await this.invitationRepository.findByToken(input.token);
    if (!invitation) throw new NotFoundError("Invitation not found");

    if (invitation.acceptedAt) {
      throw new ConflictError("Invitation already accepted");
    }

    if (invitation.expiresAt < new Date()) {
      throw new ConflictError("Invitation has expired");
    }

    const existingMember = await this.memberRepository.findByUserAndHousehold(
      input.userId,
      invitation.householdId,
    );
    if (existingMember) {
      throw new ConflictError("You are already a member of this household");
    }

    return transaction(async (tx) => {
      await this.invitationRepository.markAccepted(invitation.id, tx);

      await this.memberRepository.create(
        {
          householdId: invitation.householdId,
          userId: input.userId,
          role: "MEMBER",
        },
        tx,
      );

      return {
        householdId: invitation.householdId,
        role: "MEMBER",
      };
    });
  }
}
