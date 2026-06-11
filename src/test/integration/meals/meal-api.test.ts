import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { createTestDb } from "@/test/utils/test-db";
import { createTestUser } from "@/test/factories/user.factory";
import { createTestHousehold } from "@/test/factories/household.factory";
import { CreateMealService } from "@/application/meals/create-meal.service";
import { UpdateMealService } from "@/application/meals/update-meal.service";
import { ArchiveMealService } from "@/application/meals/archive-meal.service";
import { MealRepository } from "@/infrastructure/repositories/meal.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";

describe("Meal API Integration", () => {
  const prisma: PrismaClient = createTestDb();

  beforeAll(async () => {
    await prisma.$connect();
  });

  it("creates a meal via service", async () => {
    const user = await createTestUser(prisma);
    const { household } = await createTestHousehold(prisma, { ownerId: user.id });

    const service = new CreateMealService(new MealRepository(), new HouseholdMemberRepository());

    const result = await service.execute({
      householdId: household.id,
      userId: user.id,
      name: "Spaghetti Bolognese",
      preparationMinutes: 45,
    });

    expect(result.id).toBeDefined();
    expect(result.name).toBe("Spaghetti Bolognese");

    const saved = await prisma.meal.findUnique({ where: { id: result.id } });
    expect(saved).not.toBeNull();
    expect(saved?.preparationMinutes).toBe(45);
  });

  it("updates a meal", async () => {
    const user = await createTestUser(prisma);
    const { household } = await createTestHousehold(prisma, { ownerId: user.id });

    const meal = await prisma.meal.create({
      data: { householdId: household.id, name: "Original Name", preparationMinutes: 30 },
    });

    const service = new UpdateMealService(new MealRepository());

    const result = await service.execute({
      mealId: meal.id,
      name: "Updated Name",
      preparationMinutes: 60,
    });

    expect(result.name).toBe("Updated Name");
    expect(result.preparationMinutes).toBe(60);
  });

  it("archives a meal", async () => {
    const user = await createTestUser(prisma);
    const { household } = await createTestHousehold(prisma, { ownerId: user.id });

    const meal = await prisma.meal.create({
      data: { householdId: household.id, name: "To Archive", preparationMinutes: 20 },
    });

    const service = new ArchiveMealService(new MealRepository());

    const result = await service.execute(meal.id);

    expect(result.archived).toBe(true);
  });

  it("manages ingredients for a meal", async () => {
    const user = await createTestUser(prisma);
    const { household } = await createTestHousehold(prisma, { ownerId: user.id });

    const meal = await prisma.meal.create({
      data: { householdId: household.id, name: "With Ingredients", preparationMinutes: 15 },
    });

    await prisma.mealIngredient.create({
      data: { mealId: meal.id, name: "Tomato", quantity: 2, unit: "pcs" },
    });

    const ingredients = await prisma.mealIngredient.findMany({ where: { mealId: meal.id } });
    expect(ingredients).toHaveLength(1);
    expect(ingredients[0].name).toBe("Tomato");
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
