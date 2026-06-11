import { ChoreOccurrenceRepository } from "@/infrastructure/repositories/chore-occurrence.repository";

export interface OverdueChoreView {
  occurrenceId: string;
  choreName: string;
  ownerName?: string;
  dueDate: Date;
}

export class GetOverdueChoresQuery {
  constructor(private choreOccurrenceRepository: ChoreOccurrenceRepository) {}

  async execute(householdId: string): Promise<OverdueChoreView[]> {
    const overdue = await this.choreOccurrenceRepository.findOverdue(householdId);

    return overdue.map((c) => ({
      occurrenceId: c.id,
      choreName: c.chore.name,
      ownerName: c.completedByUser?.name ?? undefined,
      dueDate: c.dueDate,
    }));
  }
}
