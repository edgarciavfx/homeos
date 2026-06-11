import { HouseholdRepository } from "@/infrastructure/repositories/household.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { UpdateHouseholdSchema } from "@/lib/validation/schemas";
import { ValidationError, NotFoundError, ForbiddenError } from "@/lib/api/api-error";
import { authorize } from "@/lib/permissions/authorize";
import { Permission } from "@/lib/permissions/permission.enum";

export interface RenameHouseholdInput {
  householdId: string;
  userId: string;
  name: string;
}

export interface RenameHouseholdOutput {
  id: string;
  name: string;
}

export class RenameHouseholdService {
  constructor(
    private householdRepository: HouseholdRepository,
    private memberRepository: HouseholdMemberRepository,
  ) {}

  async execute(input: RenameHouseholdInput): Promise<RenameHouseholdOutput> {
    const parsed = UpdateHouseholdSchema.safeParse({ name: input.name });
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0].message);
    }

    const household = await this.householdRepository.findById(input.householdId);
    if (!household) throw new NotFoundError("Household not found");

    const membership = await this.memberRepository.findByUserAndHousehold(
      input.userId,
      input.householdId,
    );
    if (!membership) throw new ForbiddenError();

    authorize(membership.role, Permission.HOUSEHOLD_EDIT);

    const updated = await this.householdRepository.update(input.householdId, { name: input.name });
    return { id: updated.id, name: updated.name };
  }
}
