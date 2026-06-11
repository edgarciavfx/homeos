import { describe, it, expect, vi, beforeAll } from "vitest";
import { createTestDb } from "@/test/utils/test-db";
import { createTestUser } from "@/test/factories/user.factory";
import { createTestHousehold } from "@/test/factories/household.factory";

describe("Budget API Integration", () => {
  const prisma = createTestDb();

  beforeAll(async () => {
    await prisma.$connect();
  });

  it("creates a budget and retrieves summary", async () => {
    const user = await createTestUser(prisma);
    const household = await createTestHousehold(prisma, { ownerId: user.id });

    const budget = await prisma.budget.create({
      data: {
        householdId: household.id,
        month: 6,
        year: 2026,
        amount: 1000,
      },
    });

    expect(budget).toBeDefined();
    expect(budget.amount.toString()).toBe("1000");
    expect(budget.householdId).toBe(household.id);

    const found = await prisma.budget.findUnique({ where: { id: budget.id } });
    expect(found).not.toBeNull();
    expect(found?.amount.toString()).toBe("1000");
  });

  it("records a purchase against a budget", async () => {
    const user = await createTestUser(prisma);
    const household = await createTestHousehold(prisma, { ownerId: user.id });

    const budget = await prisma.budget.create({
      data: {
        householdId: household.id,
        month: 6,
        year: 2026,
        amount: 500,
      },
    });

    const purchase = await prisma.purchase.create({
      data: {
        householdId: household.id,
        budgetId: budget.id,
        amount: 75.50,
        purchaseDate: new Date("2026-06-10"),
        notes: "Test purchase",
      },
    });

    expect(purchase).toBeDefined();
    expect(purchase.amount.toString()).toBe("75.5");

    const sum = await prisma.purchase.aggregate({
      where: { budgetId: budget.id },
      _sum: { amount: true },
    });

    expect(sum._sum.amount?.toString()).toBe("75.5");
  });

  it("calculates remaining budget correctly", async () => {
    const user = await createTestUser(prisma);
    const household = await createTestHousehold(prisma, { ownerId: user.id });

    const budget = await prisma.budget.create({
      data: {
        householdId: household.id,
        month: 6,
        year: 2026,
        amount: 1000,
      },
    });

    await prisma.purchase.createMany({
      data: [
        { householdId: household.id, budgetId: budget.id, amount: 200, purchaseDate: new Date() },
        { householdId: household.id, budgetId: budget.id, amount: 150, purchaseDate: new Date() },
      ],
    });

    const aggregate = await prisma.purchase.aggregate({
      where: { budgetId: budget.id },
      _sum: { amount: true },
    });

    const spent = Number(aggregate._sum.amount ?? 0);
    const remaining = Number(budget.amount) - spent;

    expect(spent).toBe(350);
    expect(remaining).toBe(650);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
