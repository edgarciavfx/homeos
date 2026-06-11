import { describe, it, expect, vi } from "vitest";
import { InviteMemberService } from "@/application/households/invite-member.service";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { InvitationRepository } from "@/infrastructure/repositories/invitation.repository";
import { NoopEmailProvider } from "@/infrastructure/email/email-provider";
import { ValidationError, ForbiddenError, ConflictError } from "@/lib/api/api-error";
import { transaction } from "@/infrastructure/prisma/transaction-manager";

vi.mock("@/infrastructure/prisma/transaction-manager", () => ({
  transaction: vi.fn((fn) => fn({})),
}));

describe("InviteMemberService", () => {
  const mockInvitation = {
    id: "inv-1",
    householdId: "hh-1",
    email: "test@example.com",
    token: "abc123",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    acceptedAt: null,
    createdAt: new Date(),
  };

  it("creates an invitation and sends email", async () => {
    const memberRepo = new HouseholdMemberRepository();
    const invitationRepo = new InvitationRepository();
    const emailProvider = new NoopEmailProvider();

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue({
      id: "mem-1",
      householdId: "hh-1",
      userId: "owner-1",
      role: "OWNER",
      joinedAt: new Date(),
    } as never);
    vi.spyOn(memberRepo, "findByHouseholdAndEmail").mockResolvedValue(null);
    vi.spyOn(invitationRepo, "findActiveByEmail").mockResolvedValue(null);
    vi.spyOn(invitationRepo, "create").mockResolvedValue(mockInvitation);
    const sendSpy = vi.spyOn(emailProvider, "sendInviteEmail").mockResolvedValue();

    const service = new InviteMemberService(memberRepo, invitationRepo, emailProvider);
    const result = await service.execute({
      householdId: "hh-1",
      invitedByUserId: "owner-1",
      email: "test@example.com",
    });

    expect(result.invitationId).toBe("inv-1");
    expect(result.email).toBe("test@example.com");
    expect(sendSpy).toHaveBeenCalledTimes(1);
  });

  it("throws ForbiddenError when inviter is not a member", async () => {
    const memberRepo = new HouseholdMemberRepository();
    const invitationRepo = new InvitationRepository();
    const emailProvider = new NoopEmailProvider();

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue(null);

    const service = new InviteMemberService(memberRepo, invitationRepo, emailProvider);

    await expect(
      service.execute({ householdId: "hh-1", invitedByUserId: "stranger", email: "a@b.com" }),
    ).rejects.toThrow(ForbiddenError);
  });

  it("throws ConflictError when invitee is already a member", async () => {
    const memberRepo = new HouseholdMemberRepository();
    const invitationRepo = new InvitationRepository();
    const emailProvider = new NoopEmailProvider();

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue({
      id: "mem-1",
      householdId: "hh-1",
      userId: "owner-1",
      role: "OWNER",
      joinedAt: new Date(),
    } as never);
    vi.spyOn(memberRepo, "findByHouseholdAndEmail").mockResolvedValue({
      id: "mem-2",
      householdId: "hh-1",
      userId: "existing-user",
      role: "MEMBER",
      joinedAt: new Date(),
    } as never);

    const service = new InviteMemberService(memberRepo, invitationRepo, emailProvider);

    await expect(
      service.execute({ householdId: "hh-1", invitedByUserId: "owner-1", email: "existing@example.com" }),
    ).rejects.toThrow(ConflictError);
  });

  it("throws ConflictError when active invitation already exists", async () => {
    const memberRepo = new HouseholdMemberRepository();
    const invitationRepo = new InvitationRepository();
    const emailProvider = new NoopEmailProvider();

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue({
      id: "mem-1",
      householdId: "hh-1",
      userId: "owner-1",
      role: "OWNER",
      joinedAt: new Date(),
    } as never);
    vi.spyOn(memberRepo, "findByHouseholdAndEmail").mockResolvedValue(null);
    vi.spyOn(invitationRepo, "findActiveByEmail").mockResolvedValue(mockInvitation);

    const service = new InviteMemberService(memberRepo, invitationRepo, emailProvider);

    await expect(
      service.execute({ householdId: "hh-1", invitedByUserId: "owner-1", email: "test@example.com" }),
    ).rejects.toThrow(ConflictError);
  });

  it("throws ValidationError for invalid email", async () => {
    const memberRepo = new HouseholdMemberRepository();
    const invitationRepo = new InvitationRepository();
    const emailProvider = new NoopEmailProvider();

    const service = new InviteMemberService(memberRepo, invitationRepo, emailProvider);

    await expect(
      service.execute({ householdId: "hh-1", invitedByUserId: "owner-1", email: "not-an-email" }),
    ).rejects.toThrow(ValidationError);
  });
});
