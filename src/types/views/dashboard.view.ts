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
