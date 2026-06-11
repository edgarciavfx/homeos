export interface PriorityInput {
  title: string;
  isOverdue: boolean;
  isDueSoon: boolean;
  isUnassigned: boolean;
  isBudgetExceeded: boolean;
  suggestedOwnerId?: string;
  suggestedDate?: Date;
}

export interface PriorityRecommendation {
  title: string;
  suggestedOwnerId?: string;
  suggestedDate?: Date;
  priorityScore: number;
}

export function scorePriorities(inputs: PriorityInput[]): PriorityRecommendation[] {
  const scored = inputs.map((input) => {
    let score = 0;

    if (input.isOverdue) score += 100;
    if (input.isDueSoon) score += 50;
    if (input.isUnassigned) score += 25;
    if (input.isBudgetExceeded) score += 40;

    return {
      title: input.title,
      suggestedOwnerId: input.suggestedOwnerId,
      suggestedDate: input.suggestedDate,
      priorityScore: score,
    };
  });

  return scored.sort((a, b) => b.priorityScore - a.priorityScore);
}
