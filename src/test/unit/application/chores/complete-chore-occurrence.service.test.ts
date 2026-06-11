import { describe, it, expect, vi } from "vitest";
import { CompleteChoreOccurrenceService } from "@/application/chores/complete-chore-occurrence.service";
import { ChoreOccurrenceRepository } from "@/infrastructure/repositories/chore-occurrence.repository";
import { ChoreRepository } from "@/infrastructure/repositories/chore.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { ForbiddenError, NotFoundError } from "@/lib/api/api-error";

vi.mock("@/infrastructure/prisma/transaction-manager", () => ({
  transaction: vi.fn((fn) => fn({})),
}));

describe("CompleteChoreOccurrenceService", () => {
  it("completes an occurrence and creates the next one", async () => {
    const occurrenceRepo = new ChoreOccurrenceRepository();
    const choreRepo = new ChoreRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(occurrenceRepo, "findById").mockResolvedValue({
      id: "occ-1",
      choreId: "chore-1",
      dueDate: new Date("2025-01-01"),
      completedAt: null,
      completedBy: null,
      createdAt: new Date(),
    });

    vi.spyOn(choreRepo, "findById").mockResolvedValue({
      id: "chore-1",
      householdId: "hh-1",
      name: "Take out trash",
      frequency: "WEEKLY",
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      occurrences: [],
    } as never);

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue({
      id: "mem-1",
      householdId: "hh-1",
      userId: "user-1",
      role: "MEMBER",
      joinedAt: new Date(),
    } as never);

    vi.spyOn(occurrenceRepo, "complete").mockResolvedValue({
      id: "occ-1",
      choreId: "chore-1",
      dueDate: new Date("2025-01-01"),
      completedAt: new Date(),
      completedBy: "user-1",
      createdAt: new Date(),
    });

    vi.spyOn(occurrenceRepo, "create").mockResolvedValue({
      id: "occ-2",
      choreId: "chore-1",
      dueDate: new Date(),
      completedAt: null,
      completedBy: null,
      createdAt: new Date(),
    });

    const service = new CompleteChoreOccurrenceService(occurrenceRepo, choreRepo, memberRepo);

    const result = await service.execute({
      occurrenceId: "occ-1",
      userId: "user-1",
    });

    expect(result.id).toBe("occ-1");
    expect(result.completedAt).toBeTruthy();
    expect(result.completedBy).toBe("user-1");
    expect(occurrenceRepo.create).toHaveBeenCalledOnce();
  });

  it("throws NotFoundError when occurrence does not exist", async () => {
    const occurrenceRepo = new ChoreOccurrenceRepository();
    const choreRepo = new ChoreRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(occurrenceRepo, "findById").mockResolvedValue(null);

    const service = new CompleteChoreOccurrenceService(occurrenceRepo, choreRepo, memberRepo);

    await expect(
      service.execute({
        occurrenceId: "nonexistent",
        userId: "user-1",
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws ForbiddenError when user is not a household member", async () => {
    const occurrenceRepo = new ChoreOccurrenceRepository();
    const choreRepo = new ChoreRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(occurrenceRepo, "findById").mockResolvedValue({
      id: "occ-1",
      choreId: "chore-1",
      dueDate: new Date(),
      completedAt: null,
      completedBy: null,
      createdAt: new Date(),
    });

    vi.spyOn(choreRepo, "findById").mockResolvedValue({
      id: "chore-1",
      householdId: "hh-1",
      name: "Test",
      frequency: "DAILY",
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      occurrences: [],
    } as never);

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue(null);

    const service = new CompleteChoreOccurrenceService(occurrenceRepo, choreRepo, memberRepo);

    await expect(
      service.execute({
        occurrenceId: "occ-1",
        userId: "stranger",
      }),
    ).rejects.toThrow(ForbiddenError);
  });
});
