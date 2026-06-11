import { WeeklyPlanRepository } from "@/infrastructure/repositories/weekly-plan.repository";
import { ScheduledMealRepository } from "@/infrastructure/repositories/scheduled-meal.repository";
import { GroceryListRepository } from "@/infrastructure/repositories/grocery-list.repository";
import { ChoreOccurrenceRepository } from "@/infrastructure/repositories/chore-occurrence.repository";
import { BudgetRepository } from "@/infrastructure/repositories/budget.repository";
import { HouseholdRepository } from "@/infrastructure/repositories/household.repository";

export interface DashboardSummaryView {
  householdName: string;
  weeklyPlan: {
    id: string;
    status: string;
    priorityCount: number;
  } | null;
  upcomingMeals: Array<{ mealName: string; scheduledDate: Date }>;
  groceryProgress: { purchasedCount: number; remainingCount: number };
  overdueChores: Array<{ occurrenceId: string; choreName: string; dueDate: Date }>;
  budgetSnapshot: { amount: number; spent: number; remaining: number } | null;
}

export class GetDashboardSummaryQuery {
  constructor(
    private householdRepository: HouseholdRepository,
    private weeklyPlanRepository: WeeklyPlanRepository,
    private scheduledMealRepository: ScheduledMealRepository,
    private groceryListRepository: GroceryListRepository,
    private choreOccurrenceRepository: ChoreOccurrenceRepository,
    private budgetRepository: BudgetRepository,
  ) {}

  async execute(householdId: string): Promise<DashboardSummaryView> {
    const household = await this.householdRepository.findById(householdId);

    const [currentPlan, overdueChores, budget, groceryList] = await Promise.all([
      this.weeklyPlanRepository.findCurrent(householdId),
      this.choreOccurrenceRepository.findOverdue(householdId),
      this.budgetRepository.findCurrent(householdId),
      this.groceryListRepository.findCurrentByHousehold(householdId),
    ]);

    let upcomingMeals: Array<{ mealName: string; scheduledDate: Date }> = [];
    if (currentPlan) {
      const scheduled = await this.scheduledMealRepository.findByWeeklyPlan(currentPlan.id);
      upcomingMeals = scheduled.map((sm) => ({
        mealName: sm.meal.name,
        scheduledDate: sm.scheduledDate,
      }));
    }

    let groceryProgress = { purchasedCount: 0, remainingCount: 0 };
    if (groceryList) {
      groceryProgress = {
        purchasedCount: groceryList.items.filter((i) => i.completed).length,
        remainingCount: groceryList.items.filter((i) => !i.completed).length,
      };
    }

    return {
      householdName: household?.name ?? "",
      weeklyPlan: currentPlan
        ? {
            id: currentPlan.id,
            status: currentPlan.status,
            priorityCount: currentPlan.priorities.length,
          }
        : null,
      upcomingMeals,
      groceryProgress,
      overdueChores: overdueChores.map((c) => ({
        occurrenceId: c.id,
        choreName: c.chore.name,
        dueDate: c.dueDate,
      })),
      budgetSnapshot: budget
        ? (() => {
            const spent = budget.purchases.reduce((sum, p) => sum + Number(p.amount), 0);
            return {
              amount: Number(budget.amount),
              spent,
              remaining: Number(budget.amount) - spent,
            };
          })()
        : null,
    };
  }
}
