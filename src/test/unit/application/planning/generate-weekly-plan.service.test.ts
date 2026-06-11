import { describe, it, expect, vi } from "vitest";
import { GenerateWeeklyPlanService } from "@/application/planning/generate-weekly-plan.service";
import { WeeklyPlanRepository } from "@/infrastructure/repositories/weekly-plan.repository";
import { WeeklyPriorityRepository } from "@/infrastructure/repositories/weekly-priority.repository";
import { ChoreOccurrenceRepository } from "@/infrastructure/repositories/chore-occurrence.repository";
import { OwnershipRepository } from "@/infrastructure/repositories/ownership.repository";
import { BudgetRepository } from "@/infrastructure/repositories/budget.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { ValidationError, ForbiddenError, ConflictError } from "@/lib/api/api-error";

vi.mock("@/infrastructure/prisma/transaction-manager", () => ({
  transaction: vi.fn((fn) => fn({})),
}));

describe("GenerateWeeklyPlanService", () => {
  const mockChore = {
    id: "chore-1",
    name: "Clean Kitchen",
    frequency: "WEEKLY",
    householdId: "hh-1",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockOverdueChore = {
    id: "oc-1",
    choreId: "chore-1",
    dueDate: new Date("2026-06-01"),
    completedAt: null,
    completedBy: null,
    createdAt: new Date(),
    chore: mockChore,
    completedByUser: null,
  };

  const mockUpcomingChore = {
    id: "uc-1",
    choreId: "chore-1",
    dueDate: new Date("2026-06-18"),
    completedAt: null,
    completedBy: "user-1",
    createdAt: new Date(),
    chore: mockChore,
    completedByUser: { id: "user-1", name: "Alice", email: "alice@test.com" },
  };

  const mockOwnership = {
    id: "own-1",
    householdId: "hh-1",
    areaName: "Living Room",
    ownerId: "user-1",
    assignedAt: new Date(),
    owner: { id: "user-1", name: "Alice", email: "alice@test.com" },
  };

  const mockMembership = {
    id: "mem-1",
    householdId: "hh-1",
    userId: "user-1",
    role: "MEMBER" as const,
    joinedAt: new Date(),
  };

  const mockPlan = {
    id: "wp-1",
    householdId: "hh-1",
    weekStartDate: new Date("2026-06-15"),
    status: "DRAFT" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockBudget = {
    id: "budget-1",
    householdId: "hh-1",
    month: 6,
    year: 2026,
    amount: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    purchases: [],
  };

  const mockDepletedBudget = {
    ...mockBudget,
    amount: -50,
  };

  it("generates a weekly plan with all recommendation types", async () => {
    const weeklyPlanRepo = new WeeklyPlanRepository();
    const weeklyPriorityRepo = new WeeklyPriorityRepository();
    const choreOccurrenceRepo = new ChoreOccurrenceRepository();
    const ownershipRepo = new OwnershipRepository();
    const budgetRepo = new BudgetRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue(mockMembership as never);
    vi.spyOn(weeklyPlanRepo, "findByHouseholdAndWeek").mockResolvedValue(null as never);
    vi.spyOn(choreOccurrenceRepo, "findOverdue").mockResolvedValue([mockOverdueChore] as never);
    vi.spyOn(choreOccurrenceRepo, "findUpcoming").mockResolvedValue([mockUpcomingChore] as never);
    vi.spyOn(ownershipRepo, "findByHousehold").mockResolvedValue([mockOwnership] as never);
    vi.spyOn(budgetRepo, "findCurrent").mockResolvedValue(mockBudget as never);
    vi.spyOn(weeklyPlanRepo, "create").mockResolvedValue(mockPlan as never);
    vi.spyOn(weeklyPriorityRepo, "create").mockResolvedValue({ id: "pri-1" } as never);

    const service = new GenerateWeeklyPlanService(
      weeklyPlanRepo,
      weeklyPriorityRepo,
      choreOccurrenceRepo,
      ownershipRepo,
      budgetRepo,
      memberRepo,
    );

    const result = await service.execute({
      householdId: "hh-1",
      userId: "user-1",
      weekStartDate: "2026-06-15",
    });

    expect(result.weeklyPlanId).toBe("wp-1");
    expect(result.priorities.length).toBeGreaterThanOrEqual(3);
    expect(weeklyPriorityRepo.create).toHaveBeenCalled();
  });

  it("includes overdue chores in recommendations (BR-013)", async () => {
    const weeklyPlanRepo = new WeeklyPlanRepository();
    const weeklyPriorityRepo = new WeeklyPriorityRepository();
    const choreOccurrenceRepo = new ChoreOccurrenceRepository();
    const ownershipRepo = new OwnershipRepository();
    const budgetRepo = new BudgetRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue(mockMembership as never);
    vi.spyOn(weeklyPlanRepo, "findByHouseholdAndWeek").mockResolvedValue(null as never);
    vi.spyOn(choreOccurrenceRepo, "findOverdue").mockResolvedValue([mockOverdueChore] as never);
    vi.spyOn(choreOccurrenceRepo, "findUpcoming").mockResolvedValue([] as never);
    vi.spyOn(ownershipRepo, "findByHousehold").mockResolvedValue([] as never);
    vi.spyOn(budgetRepo, "findCurrent").mockResolvedValue(null as never);
    vi.spyOn(weeklyPlanRepo, "create").mockResolvedValue(mockPlan as never);
    vi.spyOn(weeklyPriorityRepo, "create").mockResolvedValue({ id: "pri-1" } as never);

    const service = new GenerateWeeklyPlanService(
      weeklyPlanRepo,
      weeklyPriorityRepo,
      choreOccurrenceRepo,
      ownershipRepo,
      budgetRepo,
      memberRepo,
    );

    const result = await service.execute({
      householdId: "hh-1",
      userId: "user-1",
      weekStartDate: "2026-06-15",
    });

    const titles = result.priorities.map((p) => p.title);
    expect(titles).toContain("Clean Kitchen");
  });

  it("includes ownership assignments in recommendations (BR-014)", async () => {
    const weeklyPlanRepo = new WeeklyPlanRepository();
    const weeklyPriorityRepo = new WeeklyPriorityRepository();
    const choreOccurrenceRepo = new ChoreOccurrenceRepository();
    const ownershipRepo = new OwnershipRepository();
    const budgetRepo = new BudgetRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue(mockMembership as never);
    vi.spyOn(weeklyPlanRepo, "findByHouseholdAndWeek").mockResolvedValue(null as never);
    vi.spyOn(choreOccurrenceRepo, "findOverdue").mockResolvedValue([] as never);
    vi.spyOn(choreOccurrenceRepo, "findUpcoming").mockResolvedValue([] as never);
    vi.spyOn(ownershipRepo, "findByHousehold").mockResolvedValue([mockOwnership] as never);
    vi.spyOn(budgetRepo, "findCurrent").mockResolvedValue(null as never);
    vi.spyOn(weeklyPlanRepo, "create").mockResolvedValue(mockPlan as never);
    vi.spyOn(weeklyPriorityRepo, "create").mockResolvedValue({ id: "pri-1" } as never);

    const service = new GenerateWeeklyPlanService(
      weeklyPlanRepo,
      weeklyPriorityRepo,
      choreOccurrenceRepo,
      ownershipRepo,
      budgetRepo,
      memberRepo,
    );

    const result = await service.execute({
      householdId: "hh-1",
      userId: "user-1",
      weekStartDate: "2026-06-15",
    });

    const titles = result.priorities.map((p) => p.title);
    expect(titles).toContain("Responsibility: Living Room");
  });

  it("includes upcoming deadlines in recommendations (BR-015)", async () => {
    const weeklyPlanRepo = new WeeklyPlanRepository();
    const weeklyPriorityRepo = new WeeklyPriorityRepository();
    const choreOccurrenceRepo = new ChoreOccurrenceRepository();
    const ownershipRepo = new OwnershipRepository();
    const budgetRepo = new BudgetRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue(mockMembership as never);
    vi.spyOn(weeklyPlanRepo, "findByHouseholdAndWeek").mockResolvedValue(null as never);
    vi.spyOn(choreOccurrenceRepo, "findOverdue").mockResolvedValue([] as never);
    vi.spyOn(choreOccurrenceRepo, "findUpcoming").mockResolvedValue([mockUpcomingChore] as never);
    vi.spyOn(ownershipRepo, "findByHousehold").mockResolvedValue([] as never);
    vi.spyOn(budgetRepo, "findCurrent").mockResolvedValue(null as never);
    vi.spyOn(weeklyPlanRepo, "create").mockResolvedValue(mockPlan as never);
    vi.spyOn(weeklyPriorityRepo, "create").mockResolvedValue({ id: "pri-1" } as never);

    const service = new GenerateWeeklyPlanService(
      weeklyPlanRepo,
      weeklyPriorityRepo,
      choreOccurrenceRepo,
      ownershipRepo,
      budgetRepo,
      memberRepo,
    );

    const result = await service.execute({
      householdId: "hh-1",
      userId: "user-1",
      weekStartDate: "2026-06-15",
    });

    const titles = result.priorities.map((p) => p.title);
    expect(titles).toContain("Clean Kitchen");
  });

  it("adds budget review priority when budget is exceeded", async () => {
    const weeklyPlanRepo = new WeeklyPlanRepository();
    const weeklyPriorityRepo = new WeeklyPriorityRepository();
    const choreOccurrenceRepo = new ChoreOccurrenceRepository();
    const ownershipRepo = new OwnershipRepository();
    const budgetRepo = new BudgetRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue(mockMembership as never);
    vi.spyOn(weeklyPlanRepo, "findByHouseholdAndWeek").mockResolvedValue(null as never);
    vi.spyOn(choreOccurrenceRepo, "findOverdue").mockResolvedValue([] as never);
    vi.spyOn(choreOccurrenceRepo, "findUpcoming").mockResolvedValue([] as never);
    vi.spyOn(ownershipRepo, "findByHousehold").mockResolvedValue([] as never);
    vi.spyOn(budgetRepo, "findCurrent").mockResolvedValue(mockDepletedBudget as never);
    vi.spyOn(weeklyPlanRepo, "create").mockResolvedValue(mockPlan as never);
    vi.spyOn(weeklyPriorityRepo, "create").mockResolvedValue({ id: "pri-1" } as never);

    const service = new GenerateWeeklyPlanService(
      weeklyPlanRepo,
      weeklyPriorityRepo,
      choreOccurrenceRepo,
      ownershipRepo,
      budgetRepo,
      memberRepo,
    );

    const result = await service.execute({
      householdId: "hh-1",
      userId: "user-1",
      weekStartDate: "2026-06-15",
    });

    const titles = result.priorities.map((p) => p.title);
    expect(titles).toContain("Review Food Budget");
  });

  it("limits recommendations to maximum 10 priorities", async () => {
    const weeklyPlanRepo = new WeeklyPlanRepository();
    const weeklyPriorityRepo = new WeeklyPriorityRepository();
    const choreOccurrenceRepo = new ChoreOccurrenceRepository();
    const ownershipRepo = new OwnershipRepository();
    const budgetRepo = new BudgetRepository();
    const memberRepo = new HouseholdMemberRepository();

    const manyChores = Array.from({ length: 15 }, (_, i) => ({
      id: `oc-${i}`,
      choreId: `chore-${i}`,
      dueDate: new Date("2026-06-01"),
      completedAt: null,
      completedBy: null,
      createdAt: new Date(),
      chore: { ...mockChore, id: `chore-${i}`, name: `Chore ${i}` },
      completedByUser: null,
    }));

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue(mockMembership as never);
    vi.spyOn(weeklyPlanRepo, "findByHouseholdAndWeek").mockResolvedValue(null as never);
    vi.spyOn(choreOccurrenceRepo, "findOverdue").mockResolvedValue(manyChores as never);
    vi.spyOn(choreOccurrenceRepo, "findUpcoming").mockResolvedValue([] as never);
    vi.spyOn(ownershipRepo, "findByHousehold").mockResolvedValue([] as never);
    vi.spyOn(budgetRepo, "findCurrent").mockResolvedValue(null as never);
    vi.spyOn(weeklyPlanRepo, "create").mockResolvedValue(mockPlan as never);
    vi.spyOn(weeklyPriorityRepo, "create").mockResolvedValue({ id: "pri-1" } as never);

    const service = new GenerateWeeklyPlanService(
      weeklyPlanRepo,
      weeklyPriorityRepo,
      choreOccurrenceRepo,
      ownershipRepo,
      budgetRepo,
      memberRepo,
    );

    const result = await service.execute({
      householdId: "hh-1",
      userId: "user-1",
      weekStartDate: "2026-06-15",
    });

    expect(result.priorities.length).toBeLessThanOrEqual(10);
    expect(weeklyPriorityRepo.create).toHaveBeenCalledTimes(10);
  });

  it("throws ValidationError for invalid date format", async () => {
    const weeklyPlanRepo = new WeeklyPlanRepository();
    const weeklyPriorityRepo = new WeeklyPriorityRepository();
    const choreOccurrenceRepo = new ChoreOccurrenceRepository();
    const ownershipRepo = new OwnershipRepository();
    const budgetRepo = new BudgetRepository();
    const memberRepo = new HouseholdMemberRepository();

    const service = new GenerateWeeklyPlanService(
      weeklyPlanRepo,
      weeklyPriorityRepo,
      choreOccurrenceRepo,
      ownershipRepo,
      budgetRepo,
      memberRepo,
    );

    await expect(
      service.execute({
        householdId: "hh-1",
        userId: "user-1",
        weekStartDate: "invalid-date",
      }),
    ).rejects.toThrow(ValidationError);
  });

  it("throws ForbiddenError when user is not a member", async () => {
    const weeklyPlanRepo = new WeeklyPlanRepository();
    const weeklyPriorityRepo = new WeeklyPriorityRepository();
    const choreOccurrenceRepo = new ChoreOccurrenceRepository();
    const ownershipRepo = new OwnershipRepository();
    const budgetRepo = new BudgetRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue(null as never);

    const service = new GenerateWeeklyPlanService(
      weeklyPlanRepo,
      weeklyPriorityRepo,
      choreOccurrenceRepo,
      ownershipRepo,
      budgetRepo,
      memberRepo,
    );

    await expect(
      service.execute({
        householdId: "hh-1",
        userId: "stranger",
        weekStartDate: "2026-06-15",
      }),
    ).rejects.toThrow(ForbiddenError);
  });

  it("throws ConflictError when plan already exists for that week", async () => {
    const weeklyPlanRepo = new WeeklyPlanRepository();
    const weeklyPriorityRepo = new WeeklyPriorityRepository();
    const choreOccurrenceRepo = new ChoreOccurrenceRepository();
    const ownershipRepo = new OwnershipRepository();
    const budgetRepo = new BudgetRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue(mockMembership as never);
    vi.spyOn(weeklyPlanRepo, "findByHouseholdAndWeek").mockResolvedValue(mockPlan as never);

    const service = new GenerateWeeklyPlanService(
      weeklyPlanRepo,
      weeklyPriorityRepo,
      choreOccurrenceRepo,
      ownershipRepo,
      budgetRepo,
      memberRepo,
    );

    await expect(
      service.execute({
        householdId: "hh-1",
        userId: "user-1",
        weekStartDate: "2026-06-15",
      }),
    ).rejects.toThrow(ConflictError);
  });

  it("handles empty data gracefully", async () => {
    const weeklyPlanRepo = new WeeklyPlanRepository();
    const weeklyPriorityRepo = new WeeklyPriorityRepository();
    const choreOccurrenceRepo = new ChoreOccurrenceRepository();
    const ownershipRepo = new OwnershipRepository();
    const budgetRepo = new BudgetRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue(mockMembership as never);
    vi.spyOn(weeklyPlanRepo, "findByHouseholdAndWeek").mockResolvedValue(null as never);
    vi.spyOn(choreOccurrenceRepo, "findOverdue").mockResolvedValue([] as never);
    vi.spyOn(choreOccurrenceRepo, "findUpcoming").mockResolvedValue([] as never);
    vi.spyOn(ownershipRepo, "findByHousehold").mockResolvedValue([] as never);
    vi.spyOn(budgetRepo, "findCurrent").mockResolvedValue(null as never);
    vi.spyOn(weeklyPlanRepo, "create").mockResolvedValue(mockPlan as never);

    const service = new GenerateWeeklyPlanService(
      weeklyPlanRepo,
      weeklyPriorityRepo,
      choreOccurrenceRepo,
      ownershipRepo,
      budgetRepo,
      memberRepo,
    );

    const result = await service.execute({
      householdId: "hh-1",
      userId: "user-1",
      weekStartDate: "2026-06-15",
    });

    expect(result.weeklyPlanId).toBe("wp-1");
    expect(result.priorities).toEqual([]);
  });
});
