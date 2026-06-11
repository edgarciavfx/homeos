import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { createTestDb } from "@/test/utils/test-db";
import { createTestUser } from "@/test/factories/user.factory";
import { createTestHousehold } from "@/test/factories/household.factory";
import { AssignOwnershipService } from "@/application/chores/assign-ownership.service";
import { OwnershipRepository } from "@/infrastructure/repositories/ownership.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";

describe("Chore Permission Enforcement", () => {
  const prisma: PrismaClient = createTestDb();

  beforeAll(async () => {
    await prisma.$connect();
  });

  it("allows OWNER to assign ownership", async () => {
    const owner = await createTestUser(prisma);
    const { household } = await createTestHousehold(prisma, { ownerId: owner.id });

    const service = new AssignOwnershipService(
      new OwnershipRepository(),
      new HouseholdMemberRepository(),
    );

    const result = await service.execute({
      householdId: household.id,
      userId: owner.id,
      areaName: "Bathroom",
      ownerId: owner.id,
    });

    expect(result.id).toBeDefined();
  });

  it("denies MEMBER from assigning ownership", async () => {
    const owner = await createTestUser(prisma);
    const { household } = await createTestHousehold(prisma, { ownerId: owner.id });
    const member = await createTestUser(prisma);

    await prisma.householdMember.create({
      data: { householdId: household.id, userId: member.id, role: "MEMBER" },
    });

    const service = new AssignOwnershipService(
      new OwnershipRepository(),
      new HouseholdMemberRepository(),
    );

    await expect(
      service.execute({
        householdId: household.id,
        userId: member.id,
        areaName: "Garage",
        ownerId: member.id,
      }),
    ).rejects.toThrow("Access denied");
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
