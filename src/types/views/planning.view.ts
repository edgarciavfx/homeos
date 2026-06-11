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
