import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { createTestDb } from "@/test/utils/test-db";
import { createTestUser } from "@/test/factories/user.factory";
import { createTestHousehold } from "@/test/factories/household.factory";
import { createTestMeal } from "@/test/factories/meal.factory";
import { ScheduledMealRepository } from "@/infrastructure/repositories/scheduled-meal.repository";
import { GroceryListRepository } from "@/infrastructure/repositories/grocery-list.repository";
import { GroceryItemRepository } from "@/infrastructure/repositories/grocery-item.repository";
import { WeeklyPlanRepository } from "@/infrastructure/repositories/weekly-plan.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { GenerateGroceryListService } from "@/application/groceries/generate-grocery-list.service";

describe("Grocery API Integration", () => {
  const prisma: PrismaClient = createTestDb();

  beforeAll(async () => {
    await prisma.$connect();
  });

  it("generates a grocery list from scheduled meals", async () => {
    const user = await createTestUser(prisma);
    const { household } = await createTestHousehold(prisma, { ownerId: user.id });

    const meal = await createTestMeal(prisma, household.id, { name: "Test Meal" });

    await prisma.mealIngredient.createMany({
      data: [
        { mealId: meal.id, name: "Tomato", quantity: 3, unit: "pcs" },
        { mealId: meal.id, name: "Basil", quantity: 1, unit: "bunch" },
      ],
    });

    const plan = await prisma.weeklyPlan.create({
      data: {
        householdId: household.id,
        weekStartDate: new Date("2026-07-06"),
        status: "DRAFT",
      },
    });

    await prisma.scheduledMeal.create({
      data: {
        weeklyPlanId: plan.id,
        mealId: meal.id,
        scheduledDate: new Date("2026-07-07"),
      },
    });

    const service = new GenerateGroceryListService(
      new GroceryListRepository(),
      new GroceryItemRepository(),
      new ScheduledMealRepository(),
      new WeeklyPlanRepository(),
      new HouseholdMemberRepository(),
    );

    const result = await service.execute({
      householdId: household.id,
      weeklyPlanId: plan.id,
      userId: user.id,
    });

    expect(result.groceryListId).toBeDefined();
    expect(result.itemCount).toBeGreaterThan(0);

    const items = await prisma.groceryItem.findMany({
      where: { groceryListId: result.groceryListId },
    });

    expect(items.length).toBeGreaterThanOrEqual(2);
    expect(items.some((i) => i.name === "Tomato")).toBe(true);
    expect(items.some((i) => i.name === "Basil")).toBe(true);
  });

  it("adds a manual item to a grocery list", async () => {
    const user = await createTestUser(prisma);
    const { household } = await createTestHousehold(prisma, { ownerId: user.id });

    const plan = await prisma.weeklyPlan.create({
      data: {
        householdId: household.id,
        weekStartDate: new Date("2026-07-13"),
        status: "DRAFT",
      },
    });

    const groceryList = await prisma.groceryList.create({
      data: { householdId: household.id, weeklyPlanId: plan.id },
    });

    const item = await prisma.groceryItem.create({
      data: {
        groceryListId: groceryList.id,
        name: "Olive Oil",
        quantity: 1,
        unit: "bottle",
        source: "MANUAL",
      },
    });

    expect(item.name).toBe("Olive Oil");
    expect(item.source).toBe("MANUAL");
    expect(item.completed).toBe(false);
  });

  it("marks a grocery item as complete", async () => {
    const user = await createTestUser(prisma);
    const { household } = await createTestHousehold(prisma, { ownerId: user.id });

    const plan = await prisma.weeklyPlan.create({
      data: {
        householdId: household.id,
        weekStartDate: new Date("2026-07-20"),
        status: "DRAFT",
      },
    });

    const groceryList = await prisma.groceryList.create({
      data: { householdId: household.id, weeklyPlanId: plan.id },
    });

    const item = await prisma.groceryItem.create({
      data: {
        groceryListId: groceryList.id,
        name: "Milk",
        quantity: 1,
        unit: "L",
        source: "MANUAL",
      },
    });

    await prisma.groceryItem.update({
      where: { id: item.id },
      data: { completed: true },
    });

    const updated = await prisma.groceryItem.findUnique({ where: { id: item.id } });
    expect(updated?.completed).toBe(true);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
