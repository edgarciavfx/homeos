import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { createTestDb } from "@/test/utils/test-db";
import { createTestUser } from "@/test/factories/user.factory";
import { createTestHousehold } from "@/test/factories/household.factory";
import { ScheduledMealRepository } from "@/infrastructure/repositories/scheduled-meal.repository";
import { MealRepository } from "@/infrastructure/repositories/meal.repository";
import { WeeklyPlanRepository } from "@/infrastructure/repositories/weekly-plan.repository";
import { WeeklyPriorityRepository } from "@/infrastructure/repositories/weekly-priority.repository";
import { ChoreOccurrenceRepository } from "@/infrastructure/repositories/chore-occurrence.repository";
import { OwnershipRepository } from "@/infrastructure/repositories/ownership.repository";
import { BudgetRepository } from "@/infrastructure/repositories/budget.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { GenerateWeeklyPlanService } from "@/application/planning/generate-weekly-plan.service";
import { ScheduleMealService } from "@/application/meals/schedule-meal.service";

describe("Planning API Integration", () => {
  const prisma: PrismaClient = createTestDb();

  beforeAll(async () => {
    await prisma.$connect();
  });

  it("generates a weekly plan with recommendations", async () => {
    const user = await createTestUser(prisma);
    const { household } = await createTestHousehold(prisma, { ownerId: user.id });

    const service = new GenerateWeeklyPlanService(
      new WeeklyPlanRepository(),
      new WeeklyPriorityRepository(),
      new ChoreOccurrenceRepository(),
      new OwnershipRepository(),
      new BudgetRepository(),
      new HouseholdMemberRepository(),
    );

    const weekStartDate = "2026-06-15";
    const result = await service.execute({
      householdId: household.id,
      userId: user.id,
      weekStartDate,
    });

    expect(result.weeklyPlanId).toBeDefined();
    expect(result.priorities).toBeDefined();

    const plan = await prisma.weeklyPlan.findUnique({ where: { id: result.weeklyPlanId } });
    expect(plan).not.toBeNull();
    expect(plan?.status).toBe("DRAFT");
  });

  it("schedules a meal on a weekly plan", async () => {
    const user = await createTestUser(prisma);
    const { household } = await createTestHousehold(prisma, { ownerId: user.id });

    const plan = await prisma.weeklyPlan.create({
      data: {
        householdId: household.id,
        weekStartDate: new Date("2026-06-22"),
        status: "DRAFT",
      },
    });

    const meal = await prisma.meal.create({
      data: { householdId: household.id, name: "Pizza", preparationMinutes: 30 },
    });

    const service = new ScheduleMealService(
      new ScheduledMealRepository(),
      new MealRepository(),
      new WeeklyPlanRepository(),
      new HouseholdMemberRepository(),
    );

    const result = await service.execute({
      weeklyPlanId: plan.id,
      userId: user.id,
      mealId: meal.id,
      scheduledDate: "2026-06-23",
    });

    expect(result.id).toBeDefined();

    const scheduled = await prisma.scheduledMeal.findUnique({ where: { id: result.id } });
    expect(scheduled).not.toBeNull();
    expect(scheduled?.mealId).toBe(meal.id);
  });

  it("creates and completes a priority", async () => {
    const user = await createTestUser(prisma);
    const { household } = await createTestHousehold(prisma, { ownerId: user.id });

    const plan = await prisma.weeklyPlan.create({
      data: {
        householdId: household.id,
        weekStartDate: new Date("2026-06-29"),
        status: "DRAFT",
      },
    });

    const priority = await prisma.weeklyPriority.create({
      data: {
        weeklyPlanId: plan.id,
        title: "Fix leaking faucet",
        ownerId: user.id,
      },
    });

    expect(priority.title).toBe("Fix leaking faucet");
    expect(priority.completed).toBe(false);

    await prisma.weeklyPriority.update({
      where: { id: priority.id },
      data: { completed: true, completedAt: new Date() },
    });

    const updated = await prisma.weeklyPriority.findUnique({ where: { id: priority.id } });
    expect(updated?.completed).toBe(true);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
