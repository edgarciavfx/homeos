import { ScheduledMealRepository } from "@/infrastructure/repositories/scheduled-meal.repository";
import { MealRepository } from "@/infrastructure/repositories/meal.repository";
import { WeeklyPlanRepository } from "@/infrastructure/repositories/weekly-plan.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { transaction } from "@/infrastructure/prisma/transaction-manager";
import { ScheduleMealSchema } from "@/lib/validation/schemas";
import { ValidationError, ForbiddenError, NotFoundError } from "@/lib/api/api-error";
import { parseDate } from "@/lib/dates/date-utils";
import { isWithinWeek } from "@/domain/planning/weekly-plan.entity";

export interface ScheduleMealInput {
  weeklyPlanId: string;
  userId: string;
  mealId: string;
  scheduledDate: string;
}

export class ScheduleMealService {
  constructor(
    private scheduledMealRepository: ScheduledMealRepository,
    private mealRepository: MealRepository,
    private weeklyPlanRepository: WeeklyPlanRepository,
    private memberRepository: HouseholdMemberRepository,
  ) {}

  async execute(input: ScheduleMealInput) {
    const parsed = ScheduleMealSchema.safeParse(input);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.errors[0].message);
    }

    const plan = await this.weeklyPlanRepository.findById(input.weeklyPlanId);
    if (!plan) throw new NotFoundError("Weekly plan not found");

    const membership = await this.memberRepository.findByUserAndHousehold(
      input.userId,
      plan.householdId,
    );
    if (!membership) throw new ForbiddenError();

    const meal = await this.mealRepository.findById(input.mealId);
    if (!meal) throw new NotFoundError("Meal not found");
    if (meal.archived) throw new Error("Archived meals cannot be scheduled");
    if (meal.householdId !== plan.householdId) throw new ForbiddenError();

    const date = parseDate(input.scheduledDate);
    if (!isWithinWeek(date, plan.weekStartDate)) {
      throw new Error("Scheduled date must be within the plan week");
    }

    return transaction(async (tx) => {
      return this.scheduledMealRepository.create(
        {
          weeklyPlanId: input.weeklyPlanId,
          mealId: input.mealId,
          scheduledDate: date,
        },
        tx,
      );
    });
  }
}
