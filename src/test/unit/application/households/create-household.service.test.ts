import { describe, it, expect, vi } from "vitest";
import { CreateHouseholdService } from "@/application/households/create-household.service";
import { HouseholdRepository } from "@/infrastructure/repositories/household.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { ValidationError } from "@/lib/api/api-error";
import { transaction } from "@/infrastructure/prisma/transaction-manager";

vi.mock("@/infrastructure/prisma/transaction-manager", () => ({
  transaction: vi.fn((fn) => fn({})),
}));

describe("CreateHouseholdService", () => {
  const mockHousehold = { id: "hh-1", name: "Test Home", ownerId: "user-1", createdAt: new Date(), updatedAt: new Date(), deletedAt: null };

  it("creates a household and adds owner as member", async () => {
    const householdRepo = new HouseholdRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(householdRepo, "create").mockResolvedValue(mockHousehold);
    vi.spyOn(memberRepo, "create").mockResolvedValue({} as never);

    const service = new CreateHouseholdService(householdRepo, memberRepo);
    const result = await service.execute({ userId: "user-1", name: "Test Home" });

    expect(result.householdId).toBe("hh-1");
    expect(result.name).toBe("Test Home");
    expect(result.ownerId).toBe("user-1");
    expect(householdRepo.create).toHaveBeenCalledWith(
      { name: "Test Home", ownerId: "user-1" },
      expect.anything(),
    );
    expect(memberRepo.create).toHaveBeenCalledWith(
      { householdId: "hh-1", userId: "user-1", role: "OWNER" },
      expect.anything(),
    );
  });

  it("throws ValidationError for empty name", async () => {
    const householdRepo = new HouseholdRepository();
    const memberRepo = new HouseholdMemberRepository();

    const service = new CreateHouseholdService(householdRepo, memberRepo);

    await expect(service.execute({ userId: "user-1", name: "" })).rejects.toThrow(ValidationError);
  });

  it("throws ValidationError for name exceeding 100 characters", async () => {
    const householdRepo = new HouseholdRepository();
    const memberRepo = new HouseholdMemberRepository();

    const service = new CreateHouseholdService(householdRepo, memberRepo);

    await expect(
      service.execute({ userId: "user-1", name: "A".repeat(101) }),
    ).rejects.toThrow(ValidationError);
  });
});
