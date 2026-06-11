import { describe, it, expect, vi } from "vitest";
import { CreateBudgetService } from "@/application/budgets/create-budget.service";
import { BudgetRepository } from "@/infrastructure/repositories/budget.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { ValidationError, ForbiddenError } from "@/lib/api/api-error";

vi.mock("@/infrastructure/prisma/transaction-manager", () => ({
  transaction: vi.fn((fn: any) => fn({})),
}));

describe("CreateBudgetService", () => {
  const mockBudget = {
    id: "budget-1",
    householdId: "hh-1",
    month: 6,
    year: 2026,
    amount: 500,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("creates a budget successfully", async () => {
    const budgetRepo = new BudgetRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue({
      id: "mem-1",
      householdId: "hh-1",
      userId: "user-1",
      role: "OWNER",
    } as never);
    vi.spyOn(budgetRepo, "create").mockResolvedValue(mockBudget);

    const service = new CreateBudgetService(budgetRepo, memberRepo);
    const result = await service.execute({
      householdId: "hh-1",
      userId: "user-1",
      month: 6,
      year: 2026,
      amount: 500,
    });

    expect(result).toBeDefined();
    expect(budgetRepo.create).toHaveBeenCalled();
  });

  it("throws ValidationError for invalid month", async () => {
    const budgetRepo = new BudgetRepository();
    const memberRepo = new HouseholdMemberRepository();

    const service = new CreateBudgetService(budgetRepo, memberRepo);

    await expect(
      service.execute({ householdId: "hh-1", userId: "user-1", month: 13, year: 2026, amount: 500 }),
    ).rejects.toThrow(ValidationError);
  });

  it("throws ValidationError for non-positive amount", async () => {
    const budgetRepo = new BudgetRepository();
    const memberRepo = new HouseholdMemberRepository();

    const service = new CreateBudgetService(budgetRepo, memberRepo);

    await expect(
      service.execute({ householdId: "hh-1", userId: "user-1", month: 6, year: 2026, amount: 0 }),
    ).rejects.toThrow(ValidationError);
  });

  it("throws ForbiddenError if user is not a household member", async () => {
    const budgetRepo = new BudgetRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue(null);

    const service = new CreateBudgetService(budgetRepo, memberRepo);

    await expect(
      service.execute({ householdId: "hh-1", userId: "user-2", month: 6, year: 2026, amount: 500 }),
    ).rejects.toThrow(ForbiddenError);
  });
});
