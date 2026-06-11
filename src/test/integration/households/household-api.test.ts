import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { createTestDb } from "@/test/utils/test-db";
import { createTestUser } from "@/test/factories/user.factory";
import { createTestHousehold } from "@/test/factories/household.factory";
import { CreateHouseholdService } from "@/application/households/create-household.service";
import { HouseholdRepository } from "@/infrastructure/repositories/household.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { InviteMemberService } from "@/application/households/invite-member.service";
import { InvitationRepository } from "@/infrastructure/repositories/invitation.repository";
import { NoopEmailProvider } from "@/infrastructure/email/email-provider";
import { AcceptInvitationService } from "@/application/households/accept-invitation.service";

describe("Household API Integration", () => {
  const prisma: PrismaClient = createTestDb();

  beforeAll(async () => {
    await prisma.$connect();
  });

  it("creates a household via service", async () => {
    const user = await createTestUser(prisma);
    const service = new CreateHouseholdService(
      new HouseholdRepository(),
      new HouseholdMemberRepository(),
    );

    const result = await service.execute({ userId: user.id, name: "My Home" });

    expect(result.householdId).toBeDefined();
    expect(result.name).toBe("My Home");
    expect(result.ownerId).toBe(user.id);

    const saved = await prisma.household.findUnique({ where: { id: result.householdId } });
    expect(saved).not.toBeNull();
    expect(saved?.name).toBe("My Home");
  });

  it("creates and retrieves household members", async () => {
    const user = await createTestUser(prisma);
    const { household } = await createTestHousehold(prisma, { ownerId: user.id });

    const members = await prisma.householdMember.findMany({
      where: { householdId: household.id },
      include: { user: true },
    });

    expect(members).toHaveLength(1);
    expect(members[0].userId).toBe(user.id);
    expect(members[0].role).toBe("OWNER");
  });

  it("invites a member and accepts invitation", async () => {
    const owner = await createTestUser(prisma);
    const { household } = await createTestHousehold(prisma, { ownerId: owner.id });
    const invitee = await createTestUser(prisma, { email: `invitee-${Date.now()}@homeos.dev` });

    const inviteService = new InviteMemberService(
      new HouseholdRepository(),
      new HouseholdMemberRepository(),
      new InvitationRepository(),
      new NoopEmailProvider(),
    );

    const { invitationId } = await inviteService.execute({
      householdId: household.id,
      invitedByUserId: owner.id,
      email: invitee.email,
    });

    const invitation = await prisma.invitation.findUnique({ where: { id: invitationId } });
    expect(invitation).not.toBeNull();
    expect(invitation?.email).toBe(invitee.email);
    expect(invitation?.acceptedAt).toBeNull();

    const acceptService = new AcceptInvitationService(
      new InvitationRepository(),
      new HouseholdMemberRepository(),
    );

    const { role } = await acceptService.execute({ token: invitation!.token, userId: invitee.id });
    expect(role).toBe("MEMBER");

    const members = await prisma.householdMember.findMany({
      where: { householdId: household.id },
    });
    expect(members).toHaveLength(2);
  });

  it("lists all households for a user", async () => {
    const user = await createTestUser(prisma);
    await createTestHousehold(prisma, { ownerId: user.id, name: "Home A" });
    await createTestHousehold(prisma, { ownerId: user.id, name: "Home B" });

    const households = await prisma.household.findMany({
      where: { ownerId: user.id },
    });
    expect(households.length).toBeGreaterThanOrEqual(2);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
