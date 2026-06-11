import { WeeklyPlanRepository } from "@/infrastructure/repositories/weekly-plan.repository";
import { WeeklyPriorityRepository } from "@/infrastructure/repositories/weekly-priority.repository";
import { ChoreOccurrenceRepository } from "@/infrastructure/repositories/chore-occurrence.repository";
import { OwnershipRepository } from "@/infrastructure/repositories/ownership.repository";
import { BudgetRepository } from "@/infrastructure/repositories/budget.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { transaction } from "@/infrastructure/prisma/transaction-manager";
import {
  scorePriorities,
  PriorityInput,
} from "@/infrastructure/recommendations/recommendation-engine";
import { CreateWeeklyPlanSchema } from "@/lib/validation/schemas";
import { ValidationError, ForbiddenError, ConflictError } from "@/lib/api/api-error";
import { parseDate, getWeekStartDate } from "@/lib/dates/date-utils";

export interface GenerateWeeklyPlanInput {
  householdId: string;
  userId: string;
  weekStartDate: string;
}

export interface WeeklyPriorityRecommendation {
  title: string;
  suggestedOwnerId?: string;
  suggestedDate?: Date;
  priorityScore: number;
}

export interface GenerateWeeklyPlanOutput {
  weeklyPlanId: string;
  priorities: WeeklyPriorityRecommendation[];
  generatedAt: Date;
}

export class GenerateWeeklyPlanService {
  constructor(
    private weeklyPlanRepository: WeeklyPlanRepository,
    private weeklyPriorityRepository: WeeklyPriorityRepository,
    private choreOccurrenceRepository: ChoreOccurrenceRepository,
    private ownershipRepository: OwnershipRepository,
    private budgetRepository: BudgetRepository,
    private memberRepository: HouseholdMemberRepository,
  ) {}

  async execute(input: GenerateWeeklyPlanInput): Promise<GenerateWeeklyPlanOutput> {
    const parsed = CreateWeeklyPlanSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0].message);
    }

    const membership = await this.memberRepository.findByUserAndHousehold(
      input.userId,
      input.householdId,
    );
    if (!membership) throw new ForbiddenError();

    const weekStart = parseDate(input.weekStartDate);

    const existing = await this.weeklyPlanRepository.findByHouseholdAndWeek(
      input.householdId,
      weekStart,
    );
    if (existing) {
      throw new ConflictError("A weekly plan already exists for this week");
    }

    const [overdueChores, upcomingChores, ownerships, budget] = await Promise.all([
      this.choreOccurrenceRepository.findOverdue(input.householdId),
      this.choreOccurrenceRepository.findUpcoming(input.householdId, 7),
      this.ownershipRepository.findByHousehold(input.householdId),
      this.budgetRepository.findCurrent(input.householdId),
    ]);

    const isBudgetExceeded = budget ? Number(budget.amount) <= 0 : false;

    const priorityInputs: PriorityInput[] = [
      ...overdueChores.map((c) => ({
        title: c.chore.name,
        isOverdue: true,
        isDueSoon: false,
        isUnassigned: !c.completedBy,
        isBudgetExceeded: false,
        suggestedOwnerId: c.completedBy ?? undefined,
        suggestedDate: c.dueDate,
      })),
      ...upcomingChores.map((c) => ({
        title: c.chore.name,
        isOverdue: false,
        isDueSoon: true,
        isUnassigned: !c.completedBy,
        isBudgetExceeded: false,
        suggestedOwnerId: c.completedBy ?? undefined,
        suggestedDate: c.dueDate,
      })),
      ...ownerships.map((o) => ({
        title: `Responsibility: ${o.areaName}`,
        isOverdue: false,
        isDueSoon: true,
        isUnassigned: !o.ownerId,
        isBudgetExceeded: false,
        suggestedOwnerId: o.ownerId,
        suggestedDate: undefined,
      })),
    ];

    if (isBudgetExceeded) {
      priorityInputs.push({
        title: "Review Food Budget",
        isOverdue: false,
        isDueSoon: true,
        isUnassigned: true,
        isBudgetExceeded: true,
      });
    }

    const recommendations = scorePriorities(priorityInputs);

    return transaction(async (tx) => {
      const plan = await this.weeklyPlanRepository.create(
        {
          householdId: input.householdId,
          weekStartDate: weekStart,
          status: "DRAFT",
        },
        tx,
      );

      for (const rec of recommendations.slice(0, 10)) {
        await this.weeklyPriorityRepository.create(
          {
            weeklyPlanId: plan.id,
            title: rec.title,
            ownerId: rec.suggestedOwnerId,
            targetDate: rec.suggestedDate,
          },
          tx,
        );
      }

      return {
        weeklyPlanId: plan.id,
        priorities: recommendations.slice(0, 10),
        generatedAt: new Date(),
      };
    });
  }
}
