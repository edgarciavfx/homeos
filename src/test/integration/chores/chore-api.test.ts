import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { createTestDb } from "@/test/utils/test-db";
import { createTestUser } from "@/test/factories/user.factory";
import { createTestHousehold } from "@/test/factories/household.factory";
import { CreateChoreService } from "@/application/chores/create-chore.service";
import { AssignOwnershipService } from "@/application/chores/assign-ownership.service";
import { CompleteChoreOccurrenceService } from "@/application/chores/complete-chore-occurrence.service";
import { ChoreRepository } from "@/infrastructure/repositories/chore.repository";
import { ChoreOccurrenceRepository } from "@/infrastructure/repositories/chore-occurrence.repository";
import { OwnershipRepository } from "@/infrastructure/repositories/ownership.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";

describe("Chore API Integration", () => {
  const prisma: PrismaClient = createTestDb();

  beforeAll(async () => {
    await prisma.$connect();
  });

  it("creates a chore via service", async () => {
    const user = await createTestUser(prisma);
    const { household } = await createTestHousehold(prisma, { ownerId: user.id });

    const service = new CreateChoreService(
      new ChoreRepository(),
      new ChoreOccurrenceRepository(),
      new HouseholdMemberRepository(),
    );

    const result = await service.execute({
      householdId: household.id,
      userId: user.id,
      name: "Take out trash",
      frequency: "WEEKLY",
    });

    expect(result.id).toBeDefined();
    expect(result.name).toBe("Take out trash");
    expect(result.frequency).toBe("WEEKLY");

    const saved = await prisma.chore.findUnique({ where: { id: result.id } });
    expect(saved).not.toBeNull();

    const occurrences = await prisma.choreOccurrence.findMany({ where: { choreId: result.id } });
    expect(occurrences.length).toBeGreaterThan(0);
  });

  it("assigns an ownership area", async () => {
    const user = await createTestUser(prisma);
    const { household } = await createTestHousehold(prisma, { ownerId: user.id });

    const service = new AssignOwnershipService(
      new OwnershipRepository(),
      new HouseholdMemberRepository(),
    );

    const result = await service.execute({
      householdId: household.id,
      userId: user.id,
      areaName: "Kitchen",
      ownerId: user.id,
    });

    expect(result.id).toBeDefined();
    expect(result.areaName).toBe("Kitchen");

    const saved = await prisma.ownershipAssignment.findUnique({ where: { id: result.id } });
    expect(saved).not.toBeNull();
    expect(saved?.areaName).toBe("Kitchen");
  });

  it("completes a chore occurrence", async () => {
    const user = await createTestUser(prisma);
    const { household } = await createTestHousehold(prisma, { ownerId: user.id });

    const chore = await prisma.chore.create({
      data: {
        householdId: household.id,
        name: "Vacuum living room",
        frequency: "WEEKLY",
      },
    });

    const occurrence = await prisma.choreOccurrence.create({
      data: {
        choreId: chore.id,
        dueDate: new Date("2026-06-15"),
      },
    });

    const service = new CompleteChoreOccurrenceService(
      new ChoreOccurrenceRepository(),
      new ChoreRepository(),
      new HouseholdMemberRepository(),
    );

    const result = await service.execute({
      occurrenceId: occurrence.id,
      userId: user.id,
    });

    expect(result.completedAt).toBeDefined();
    expect(result.completedBy).toBe(user.id);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
