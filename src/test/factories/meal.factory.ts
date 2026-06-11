import { PrismaClient } from "@prisma/client";

export async function createTestMeal(prisma: PrismaClient, householdId: string, overrides?: { name?: string }) {
  return prisma.meal.create({
    data: {
      householdId,
      name: overrides?.name ?? `Test Meal ${Date.now()}`,
      preparationMinutes: 30,
    },
  });
}
