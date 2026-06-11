import { describe, it, expect, vi } from "vitest";
import { CreateChoreService } from "@/application/chores/create-chore.service";
import { ChoreRepository } from "@/infrastructure/repositories/chore.repository";
import { ChoreOccurrenceRepository } from "@/infrastructure/repositories/chore-occurrence.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { ValidationError, ForbiddenError } from "@/lib/api/api-error";
import type { ChoreFrequency } from "@prisma/client";

vi.mock("@/infrastructure/prisma/transaction-manager", () => ({
  transaction: vi.fn((fn) => fn({})),
}));

describe("CreateChoreService", () => {
  const mockChore = {
    id: "chore-1",
    householdId: "hh-1",
    name: "Take out trash",
    frequency: "WEEKLY" as ChoreFrequency,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  it("creates a chore and its first occurrence", async () => {
    const choreRepo = new ChoreRepository();
    const occurrenceRepo = new ChoreOccurrenceRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue({
      id: "mem-1",
      householdId: "hh-1",
      userId: "user-1",
      role: "MEMBER",
      joinedAt: new Date(),
    } as never);

    vi.spyOn(choreRepo, "create").mockResolvedValue(mockChore);
    vi.spyOn(occurrenceRepo, "create").mockResolvedValue({
      id: "occ-1",
      choreId: "chore-1",
      dueDate: new Date(),
      completedAt: null,
      completedBy: null,
      createdAt: new Date(),
    });

    const service = new CreateChoreService(choreRepo, occurrenceRepo, memberRepo);
    const result = await service.execute({
      householdId: "hh-1",
      userId: "user-1",
      name: "Take out trash",
      frequency: "WEEKLY",
    });

    expect(result.id).toBe("chore-1");
    expect(result.name).toBe("Take out trash");
    expect(result.frequency).toBe("WEEKLY");
    expect(occurrenceRepo.create).toHaveBeenCalledOnce();
  });

  it("throws ForbiddenError when user is not a household member", async () => {
    const choreRepo = new ChoreRepository();
    const occurrenceRepo = new ChoreOccurrenceRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue(null);

    const service = new CreateChoreService(choreRepo, occurrenceRepo, memberRepo);

    await expect(
      service.execute({
        householdId: "hh-1",
        userId: "stranger",
        name: "Vacuum",
        frequency: "WEEKLY",
      }),
    ).rejects.toThrow(ForbiddenError);
  });

  it("throws ValidationError for empty name", async () => {
    const choreRepo = new ChoreRepository();
    const occurrenceRepo = new ChoreOccurrenceRepository();
    const memberRepo = new HouseholdMemberRepository();

    const service = new CreateChoreService(choreRepo, occurrenceRepo, memberRepo);

    await expect(
      service.execute({
        householdId: "hh-1",
        userId: "user-1",
        name: "",
        frequency: "WEEKLY",
      }),
    ).rejects.toThrow(ValidationError);
  });

  it("throws ValidationError for invalid frequency", async () => {
    const choreRepo = new ChoreRepository();
    const occurrenceRepo = new ChoreOccurrenceRepository();
    const memberRepo = new HouseholdMemberRepository();

    const service = new CreateChoreService(choreRepo, occurrenceRepo, memberRepo);

    await expect(
      service.execute({
        householdId: "hh-1",
        userId: "user-1",
        name: "Clean",
        frequency: "YEARLY" as any,
      }),
    ).rejects.toThrow(ValidationError);
  });
});
