import { MealRepository } from "@/infrastructure/repositories/meal.repository";
import { ScheduledMealRepository } from "@/infrastructure/repositories/scheduled-meal.repository";
import { WeeklyPlanRepository } from "@/infrastructure/repositories/weekly-plan.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { scoreMeals, MealScoringInput } from "@/infrastructure/recommendations/meal-recommendation-engine";
import { MIN_MEAL_RECOMMENDATIONS } from "@/lib/constants";
import { ForbiddenError, NotFoundError } from "@/lib/api/api-error";

export interface GenerateMealRecommendationsInput {
  householdId: string;
  weeklyPlanId: string;
  userId: string;
}

export class GenerateMealRecommendationsService {
  constructor(
    private mealRepository: MealRepository,
    private scheduledMealRepository: ScheduledMealRepository,
    private weeklyPlanRepository: WeeklyPlanRepository,
    private memberRepository: HouseholdMemberRepository,
  ) {}

  async execute(input: GenerateMealRecommendationsInput) {
    const membership = await this.memberRepository.findByUserAndHousehold(
      input.userId,
      input.householdId,
    );
    if (!membership) throw new ForbiddenError();

    const plan = await this.weeklyPlanRepository.findById(input.weeklyPlanId);
    if (!plan) throw new NotFoundError("Weekly plan not found");

    const { meals } = await this.mealRepository.findByHousehold(input.householdId, {
      archived: false,
      pageSize: 100,
    });

    const scheduledMeals = await this.scheduledMealRepository.findByWeeklyPlan(input.weeklyPlanId);

    const recentMealIds = new Set(scheduledMeals.map((sm) => sm.mealId));
    const mealUsageCount = new Map<string, number>();

    for (const sm of scheduledMeals) {
      mealUsageCount.set(sm.mealId, (mealUsageCount.get(sm.mealId) ?? 0) + 1);
    }

    const scoringInputs: MealScoringInput[] = meals.map((meal) => ({
      mealId: meal.id,
      mealName: meal.name,
      preparationMinutes: meal.preparationMinutes,
      usageFrequency: mealUsageCount.get(meal.id) ?? 0,
      recentUsageCount: recentMealIds.has(meal.id) ? 1 : 0,
    }));

    const recommendations = scoreMeals(scoringInputs);

    const topRecommendations = recommendations.slice(0, MIN_MEAL_RECOMMENDATIONS);

    return {
      recommendations: topRecommendations,
    };
  }
}
