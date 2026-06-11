import { describe, it, expect, vi } from "vitest";
import { AssignOwnershipService } from "@/application/chores/assign-ownership.service";
import { OwnershipRepository } from "@/infrastructure/repositories/ownership.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { ValidationError, ForbiddenError } from "@/lib/api/api-error";
import { ForbiddenError as AuthForbiddenError } from "@/lib/permissions/authorize";

vi.mock("@/infrastructure/prisma/transaction-manager", () => ({
  transaction: vi.fn((fn) => fn({})),
}));

describe("AssignOwnershipService", () => {
  it("assigns ownership successfully", async () => {
    const ownershipRepo = new OwnershipRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue({
      id: "mem-1",
      householdId: "hh-1",
      userId: "user-1",
      role: "OWNER",
      joinedAt: new Date(),
    } as never);

    vi.spyOn(ownershipRepo, "create").mockResolvedValue({
      id: "own-1",
      householdId: "hh-1",
      areaName: "Kitchen",
      ownerId: "550e8400-e29b-41d4-a716-446655440002",
      assignedAt: new Date(),
    });

    const service = new AssignOwnershipService(ownershipRepo, memberRepo);
    const result = await service.execute({
      householdId: "hh-1",
      userId: "user-1",
      areaName: "Kitchen",
      ownerId: "550e8400-e29b-41d4-a716-446655440002",
    });

    expect(result.id).toBe("own-1");
    expect(result.areaName).toBe("Kitchen");
    expect(result.ownerId).toBe("550e8400-e29b-41d4-a716-446655440002");
  });

  it("throws ForbiddenError when user is not a household member", async () => {
    const ownershipRepo = new OwnershipRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue(null);

    const service = new AssignOwnershipService(ownershipRepo, memberRepo);

    await expect(
      service.execute({
        householdId: "hh-1",
        userId: "stranger",
        areaName: "Kitchen",
        ownerId: "550e8400-e29b-41d4-a716-446655440002",
      }),
    ).rejects.toThrow(ForbiddenError);
  });

  it("throws ValidationError for empty area name", async () => {
    const ownershipRepo = new OwnershipRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue({
      id: "mem-1",
      householdId: "hh-1",
      userId: "user-1",
      role: "OWNER",
      joinedAt: new Date(),
    } as never);

    const service = new AssignOwnershipService(ownershipRepo, memberRepo);

    await expect(
      service.execute({
        householdId: "hh-1",
        userId: "user-1",
        areaName: "",
        ownerId: "550e8400-e29b-41d4-a716-446655440002",
      }),
    ).rejects.toThrow(ValidationError);
  });

  it("throws ForbiddenError when user is MEMBER (not OWNER)", async () => {
    const ownershipRepo = new OwnershipRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue({
      id: "mem-1",
      householdId: "hh-1",
      userId: "user-1",
      role: "MEMBER",
      joinedAt: new Date(),
    } as never);

    const service = new AssignOwnershipService(ownershipRepo, memberRepo);

    await expect(
      service.execute({
        householdId: "hh-1",
        userId: "user-1",
        areaName: "Kitchen",
        ownerId: "550e8400-e29b-41d4-a716-446655440002",
      }),
    ).rejects.toThrow(AuthForbiddenError);
  });
});
