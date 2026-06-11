import { ChoreRepository } from "@/infrastructure/repositories/chore.repository";
import { ChoreOccurrenceRepository } from "@/infrastructure/repositories/chore-occurrence.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { transaction } from "@/infrastructure/prisma/transaction-manager";
import { CreateChoreSchema } from "@/lib/validation/schemas";
import { ValidationError, ForbiddenError } from "@/lib/api/api-error";
import { computeNextDueDate } from "@/domain/chores/chore.entity";

export interface CreateChoreInput {
  householdId: string;
  userId: string;
  name: string;
  frequency: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY";
  ownerId?: string;
}

export class CreateChoreService {
  constructor(
    private choreRepository: ChoreRepository,
    private choreOccurrenceRepository: ChoreOccurrenceRepository,
    private memberRepository: HouseholdMemberRepository,
  ) {}

  async execute(input: CreateChoreInput) {
    const parsed = CreateChoreSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0].message);
    }

    const membership = await this.memberRepository.findByUserAndHousehold(
      input.userId,
      input.householdId,
    );
    if (!membership) throw new ForbiddenError();

    return transaction(async (tx) => {
      const chore = await this.choreRepository.create(
        {
          householdId: input.householdId,
          name: input.name,
          frequency: input.frequency,
        },
        tx,
      );

      const dueDate = computeNextDueDate(input.frequency);
      await this.choreOccurrenceRepository.create(
        { choreId: chore.id, dueDate },
        tx,
      );

      return chore;
    });
  }
}
