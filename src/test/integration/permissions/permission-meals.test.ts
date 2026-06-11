import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { createTestDb } from "@/test/utils/test-db";
import { createTestUser } from "@/test/factories/user.factory";
import { createTestHousehold } from "@/test/factories/household.factory";
import { CreateMealService } from "@/application/meals/create-meal.service";
import { MealRepository } from "@/infrastructure/repositories/meal.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";

describe("Meal Permission Enforcement", () => {
  const prisma: PrismaClient = createTestDb();

  beforeAll(async () => {
    await prisma.$connect();
  });

  it("allows MEMBER to create a meal", async () => {
    const owner = await createTestUser(prisma);
    const { household } = await createTestHousehold(prisma, { ownerId: owner.id });
    const member = await createTestUser(prisma);

    await prisma.householdMember.create({
      data: { householdId: household.id, userId: member.id, role: "MEMBER" },
    });

    const service = new CreateMealService(new MealRepository(), new HouseholdMemberRepository());

    const result = await service.execute({
      householdId: household.id,
      userId: member.id,
      name: "Member's Meal",
      preparationMinutes: 20,
    });

    expect(result.id).toBeDefined();
  });

  it("denies non-member from creating a meal", async () => {
    const owner = await createTestUser(prisma);
    const { household } = await createTestHousehold(prisma, { ownerId: owner.id });
    const outsider = await createTestUser(prisma);

    const service = new CreateMealService(new MealRepository(), new HouseholdMemberRepository());

    await expect(
      service.execute({
        householdId: household.id,
        userId: outsider.id,
        name: "Outsider's Meal",
        preparationMinutes: 10,
      }),
    ).rejects.toThrow("Access denied");
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
