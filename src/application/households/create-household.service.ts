import { HouseholdRepository } from "@/infrastructure/repositories/household.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { transaction } from "@/infrastructure/prisma/transaction-manager";
import { CreateHouseholdSchema } from "@/lib/validation/schemas";
import { ValidationError } from "@/lib/api/api-error";

export interface CreateHouseholdInput {
  userId: string;
  name: string;
}

export interface CreateHouseholdOutput {
  householdId: string;
  name: string;
  ownerId: string;
  createdAt: Date;
}

export class CreateHouseholdService {
  constructor(
    private householdRepository: HouseholdRepository,
    private memberRepository: HouseholdMemberRepository,
  ) {}

  async execute(input: CreateHouseholdInput): Promise<CreateHouseholdOutput> {
    const parsed = CreateHouseholdSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0].message);
    }

    return transaction(async (tx) => {
      const household = await this.householdRepository.create(
        { name: input.name, ownerId: input.userId },
        tx,
      );

      await this.memberRepository.create(
        {
          householdId: household.id,
          userId: input.userId,
          role: "OWNER",
        },
        tx,
      );

      return {
        householdId: household.id,
        name: household.name,
        ownerId: household.ownerId,
        createdAt: household.createdAt,
      };
    });
  }
}
