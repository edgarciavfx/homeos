import { OwnershipRepository } from "@/infrastructure/repositories/ownership.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { transaction } from "@/infrastructure/prisma/transaction-manager";
import { AssignOwnershipSchema } from "@/lib/validation/schemas";
import { ValidationError, ForbiddenError } from "@/lib/api/api-error";
import { authorize } from "@/lib/permissions/authorize";
import { Permission } from "@/lib/permissions/permission.enum";
import { HouseholdRole } from "@prisma/client";

export interface AssignOwnershipInput {
  householdId: string;
  userId: string;
  areaName: string;
  ownerId: string;
}

export class AssignOwnershipService {
  constructor(
    private ownershipRepository: OwnershipRepository,
    private memberRepository: HouseholdMemberRepository,
  ) {}

  async execute(input: AssignOwnershipInput) {
    const parsed = AssignOwnershipSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0].message);
    }

    const membership = await this.memberRepository.findByUserAndHousehold(
      input.userId,
      input.householdId,
    );
    if (!membership) throw new ForbiddenError();

    authorize(membership.role as HouseholdRole, Permission.OWNERSHIP_MANAGE);

    return transaction(async (tx) => {
      return this.ownershipRepository.create(
        {
          householdId: input.householdId,
          areaName: input.areaName,
          ownerId: input.ownerId,
        },
        tx,
      );
    });
  }
}
