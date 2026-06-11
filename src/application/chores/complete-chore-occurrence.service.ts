import { ChoreOccurrenceRepository } from "@/infrastructure/repositories/chore-occurrence.repository";
import { ChoreRepository } from "@/infrastructure/repositories/chore.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { transaction } from "@/infrastructure/prisma/transaction-manager";
import { ForbiddenError, NotFoundError } from "@/lib/api/api-error";
import { computeNextDueDate } from "@/domain/chores/chore.entity";

export interface CompleteChoreOccurrenceInput {
  occurrenceId: string;
  userId: string;
}

export class CompleteChoreOccurrenceService {
  constructor(
    private choreOccurrenceRepository: ChoreOccurrenceRepository,
    private choreRepository: ChoreRepository,
    private memberRepository: HouseholdMemberRepository,
  ) {}

  async execute(input: CompleteChoreOccurrenceInput) {
    const occurrence = await this.choreOccurrenceRepository.findById(input.occurrenceId);
    if (!occurrence) throw new NotFoundError("Chore occurrence not found");

    const chore = await this.choreRepository.findById(occurrence.choreId);
    if (!chore) throw new NotFoundError("Chore not found");

    const membership = await this.memberRepository.findByUserAndHousehold(
      input.userId,
      chore.householdId,
    );
    if (!membership) throw new ForbiddenError();

    return transaction(async (tx) => {
      const completed = await this.choreOccurrenceRepository.complete(
        input.occurrenceId,
        input.userId,
        tx,
      );

      const nextDue = computeNextDueDate(chore.frequency as any);
      await this.choreOccurrenceRepository.create(
        { choreId: chore.id, dueDate: nextDue },
        tx,
      );

      return completed;
    });
  }
}
