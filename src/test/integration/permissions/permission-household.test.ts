import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { createTestDb } from "@/test/utils/test-db";
import { createTestUser } from "@/test/factories/user.factory";
import { createTestHousehold } from "@/test/factories/household.factory";
import { InviteMemberService } from "@/application/households/invite-member.service";
import { HouseholdRepository } from "@/infrastructure/repositories/household.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { InvitationRepository } from "@/infrastructure/repositories/invitation.repository";
import { NoopEmailProvider } from "@/infrastructure/email/email-provider";

describe("Household Permission Enforcement", () => {
  const prisma: PrismaClient = createTestDb();

  beforeAll(async () => {
    await prisma.$connect();
  });

  it("allows OWNER to invite members", async () => {
    const owner = await createTestUser(prisma);
    const { household } = await createTestHousehold(prisma, { ownerId: owner.id });

    const service = new InviteMemberService(
      new HouseholdRepository(),
      new HouseholdMemberRepository(),
      new InvitationRepository(),
      new NoopEmailProvider(),
    );

    const result = await service.execute({
      householdId: household.id,
      invitedByUserId: owner.id,
      email: `new-member-${Date.now()}@homeos.dev`,
    });

    expect(result.invitationId).toBeDefined();
  });

  it("denies MEMBER from inviting other members", async () => {
    const owner = await createTestUser(prisma);
    const { household } = await createTestHousehold(prisma, { ownerId: owner.id });
    const member = await createTestUser(prisma);

    await prisma.householdMember.create({
      data: { householdId: household.id, userId: member.id, role: "MEMBER" },
    });

    const service = new InviteMemberService(
      new HouseholdRepository(),
      new HouseholdMemberRepository(),
      new InvitationRepository(),
      new NoopEmailProvider(),
    );

    await expect(
      service.execute({
        householdId: household.id,
        invitedByUserId: member.id,
        email: `should-fail-${Date.now()}@homeos.dev`,
      }),
    ).rejects.toThrow("Access denied");
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
