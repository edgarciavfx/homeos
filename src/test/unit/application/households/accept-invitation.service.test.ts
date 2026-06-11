import { describe, it, expect, vi } from "vitest";
import { AcceptInvitationService } from "@/application/households/accept-invitation.service";
import { InvitationRepository } from "@/infrastructure/repositories/invitation.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { NotFoundError, ConflictError } from "@/lib/api/api-error";
import { transaction } from "@/infrastructure/prisma/transaction-manager";

vi.mock("@/infrastructure/prisma/transaction-manager", () => ({
  transaction: vi.fn((fn) => fn({})),
}));

describe("AcceptInvitationService", () => {
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const pastDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);

  const mockInvitation = {
    id: "inv-1",
    householdId: "hh-1",
    email: "test@example.com",
    token: "valid-token",
    expiresAt: futureDate,
    acceptedAt: null,
    createdAt: new Date(),
  };

  it("accepts a valid invitation and creates membership", async () => {
    const invitationRepo = new InvitationRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(invitationRepo, "findByToken").mockResolvedValue(mockInvitation);
    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue(null);
    vi.spyOn(invitationRepo, "markAccepted").mockResolvedValue({} as never);
    vi.spyOn(memberRepo, "create").mockResolvedValue({} as never);

    const service = new AcceptInvitationService(invitationRepo, memberRepo);
    const result = await service.execute({ token: "valid-token", userId: "user-2" });

    expect(result.householdId).toBe("hh-1");
    expect(result.role).toBe("MEMBER");
    expect(invitationRepo.markAccepted).toHaveBeenCalledWith("inv-1", expect.anything());
    expect(memberRepo.create).toHaveBeenCalledWith(
      { householdId: "hh-1", userId: "user-2", role: "MEMBER" },
      expect.anything(),
    );
  });

  it("throws NotFoundError when invitation does not exist", async () => {
    const invitationRepo = new InvitationRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(invitationRepo, "findByToken").mockResolvedValue(null);

    const service = new AcceptInvitationService(invitationRepo, memberRepo);

    await expect(
      service.execute({ token: "invalid-token", userId: "user-2" }),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws ConflictError when invitation already accepted", async () => {
    const invitationRepo = new InvitationRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(invitationRepo, "findByToken").mockResolvedValue({
      ...mockInvitation,
      acceptedAt: new Date(),
    });

    const service = new AcceptInvitationService(invitationRepo, memberRepo);

    await expect(
      service.execute({ token: "used-token", userId: "user-2" }),
    ).rejects.toThrow(ConflictError);
  });

  it("throws ConflictError when invitation has expired", async () => {
    const invitationRepo = new InvitationRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(invitationRepo, "findByToken").mockResolvedValue({
      ...mockInvitation,
      expiresAt: pastDate,
    });

    const service = new AcceptInvitationService(invitationRepo, memberRepo);

    await expect(
      service.execute({ token: "expired-token", userId: "user-2" }),
    ).rejects.toThrow(ConflictError);
  });

  it("throws ConflictError when user is already a member", async () => {
    const invitationRepo = new InvitationRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(invitationRepo, "findByToken").mockResolvedValue(mockInvitation);
    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue({
      id: "mem-1",
      householdId: "hh-1",
      userId: "user-2",
      role: "MEMBER",
      joinedAt: new Date(),
    } as never);

    const service = new AcceptInvitationService(invitationRepo, memberRepo);

    await expect(
      service.execute({ token: "valid-token", userId: "user-2" }),
    ).rejects.toThrow(ConflictError);
  });
});
