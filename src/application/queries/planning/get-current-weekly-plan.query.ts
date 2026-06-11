import { WeeklyPlanRepository } from "@/infrastructure/repositories/weekly-plan.repository";

export interface CurrentWeeklyPlanView {
  id: string;
  status: string;
  weekStartDate: Date;
  priorities: Array<{
    id: string;
    title: string;
    description: string | null;
    ownerId: string | null;
    targetDate: Date | null;
    completed: boolean;
  }>;
  meals: Array<{
    id: string;
    mealId: string;
    mealName: string;
    scheduledDate: Date;
  }>;
}

export class GetCurrentWeeklyPlanQuery {
  constructor(private weeklyPlanRepository: WeeklyPlanRepository) {}

  async execute(householdId: string): Promise<CurrentWeeklyPlanView | null> {
    const plan = await this.weeklyPlanRepository.findCurrent(householdId);
    if (!plan) return null;

    return {
      id: plan.id,
      status: plan.status,
      weekStartDate: plan.weekStartDate,
      priorities: plan.priorities.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        ownerId: p.ownerId,
        targetDate: p.targetDate,
        completed: p.completed,
      })),
      meals: plan.scheduledMeals.map((sm) => ({
        id: sm.id,
        mealId: sm.mealId,
        mealName: sm.meal.name,
        scheduledDate: sm.scheduledDate,
      })),
    };
  }
}
