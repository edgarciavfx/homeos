import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { createTestDb } from "@/test/utils/test-db";
import { createTestUser } from "@/test/factories/user.factory";
import { createTestHousehold } from "@/test/factories/household.factory";
import { CreateBudgetService } from "@/application/budgets/create-budget.service";
import { BudgetRepository } from "@/infrastructure/repositories/budget.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";

describe("Budget Permission Enforcement", () => {
  const prisma: PrismaClient = createTestDb();

  beforeAll(async () => {
    await prisma.$connect();
  });

  it("allows OWNER to create a budget", async () => {
    const owner = await createTestUser(prisma);
    const { household } = await createTestHousehold(prisma, { ownerId: owner.id });

    const service = new CreateBudgetService(
      new BudgetRepository(),
      new HouseholdMemberRepository(),
    );

    const result = await service.execute({
      householdId: household.id,
      userId: owner.id,
      month: 7,
      year: 2026,
      amount: 800,
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
  });

  it("denies MEMBER from creating a budget", async () => {
    const owner = await createTestUser(prisma);
    const { household } = await createTestHousehold(prisma, { ownerId: owner.id });
    const member = await createTestUser(prisma);

    await prisma.householdMember.create({
      data: { householdId: household.id, userId: member.id, role: "MEMBER" },
    });

    const service = new CreateBudgetService(
      new BudgetRepository(),
      new HouseholdMemberRepository(),
    );

    await expect(
      service.execute({
        householdId: household.id,
        userId: member.id,
        month: 8,
        year: 2026,
        amount: 500,
      }),
    ).rejects.toThrow("Access denied");
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
