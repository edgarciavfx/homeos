import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { createTestDb } from "@/test/utils/test-db";
import { createTestUser } from "@/test/factories/user.factory";
import { createTestHousehold } from "@/test/factories/household.factory";
import { GenerateWeeklyPlanService } from "@/application/planning/generate-weekly-plan.service";
import { WeeklyPlanRepository } from "@/infrastructure/repositories/weekly-plan.repository";
import { WeeklyPriorityRepository } from "@/infrastructure/repositories/weekly-priority.repository";
import { ChoreOccurrenceRepository } from "@/infrastructure/repositories/chore-occurrence.repository";
import { OwnershipRepository } from "@/infrastructure/repositories/ownership.repository";
import { BudgetRepository } from "@/infrastructure/repositories/budget.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";

describe("Planning Permission Enforcement", () => {
  const prisma: PrismaClient = createTestDb();

  beforeAll(async () => {
    await prisma.$connect();
  });

  it("allows MEMBER to generate a weekly plan", async () => {
    const owner = await createTestUser(prisma);
    const { household } = await createTestHousehold(prisma, { ownerId: owner.id });
    const member = await createTestUser(prisma);

    await prisma.householdMember.create({
      data: { householdId: household.id, userId: member.id, role: "MEMBER" },
    });

    const service = new GenerateWeeklyPlanService(
      new WeeklyPlanRepository(),
      new WeeklyPriorityRepository(),
      new ChoreOccurrenceRepository(),
      new OwnershipRepository(),
      new BudgetRepository(),
      new HouseholdMemberRepository(),
    );

    const result = await service.execute({
      householdId: household.id,
      userId: member.id,
      weekStartDate: "2026-07-27",
    });

    expect(result.weeklyPlanId).toBeDefined();
  });

  it("denies non-member from generating a plan", async () => {
    const owner = await createTestUser(prisma);
    const { household } = await createTestHousehold(prisma, { ownerId: owner.id });
    const outsider = await createTestUser(prisma);

    const service = new GenerateWeeklyPlanService(
      new WeeklyPlanRepository(),
      new WeeklyPriorityRepository(),
      new ChoreOccurrenceRepository(),
      new OwnershipRepository(),
      new BudgetRepository(),
      new HouseholdMemberRepository(),
    );

    await expect(
      service.execute({
        householdId: household.id,
        userId: outsider.id,
        weekStartDate: "2026-08-03",
      }),
    ).rejects.toThrow("Access denied");
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
