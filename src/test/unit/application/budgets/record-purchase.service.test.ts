import { describe, it, expect, vi } from "vitest";
import { RecordPurchaseService } from "@/application/budgets/record-purchase.service";
import { PurchaseRepository } from "@/infrastructure/repositories/purchase.repository";
import { BudgetRepository } from "@/infrastructure/repositories/budget.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { Prisma } from "@prisma/client";
import { ValidationError, NotFoundError, ForbiddenError } from "@/lib/api/api-error";

vi.mock("@/infrastructure/prisma/transaction-manager", () => ({
  transaction: vi.fn((fn: any) => fn({})),
}));

describe("RecordPurchaseService", () => {
  const mockBudget = {
    id: "budget-1",
    householdId: "hh-1",
    month: 6,
    year: 2026,
    amount: new Prisma.Decimal(500),
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("records a purchase successfully", async () => {
    const purchaseRepo = new PurchaseRepository();
    const budgetRepo = new BudgetRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(budgetRepo, "findById").mockResolvedValue(mockBudget as never);
    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue({
      id: "mem-1",
      householdId: "hh-1",
      userId: "user-1",
      role: "MEMBER",
    } as never);
    vi.spyOn(purchaseRepo, "create").mockResolvedValue({
      id: "purchase-1",
      householdId: "hh-1",
      budgetId: "budget-1",
      amount: new Prisma.Decimal(50),
      purchaseDate: new Date("2026-06-10"),
      notes: "Groceries",
    } as never);

    const service = new RecordPurchaseService(purchaseRepo, budgetRepo, memberRepo);
    const result = await service.execute({
      budgetId: "budget-1",
      userId: "user-1",
      amount: 50,
      purchaseDate: "2026-06-10",
      notes: "Groceries",
    });

    expect(result).toBeDefined();
    expect(purchaseRepo.create).toHaveBeenCalled();
  });

  it("throws ValidationError for non-positive amount", async () => {
    const purchaseRepo = new PurchaseRepository();
    const budgetRepo = new BudgetRepository();
    const memberRepo = new HouseholdMemberRepository();

    const service = new RecordPurchaseService(purchaseRepo, budgetRepo, memberRepo);

    await expect(
      service.execute({
        budgetId: "budget-1",
        userId: "user-1",
        amount: -10,
        purchaseDate: "2026-06-10",
      }),
    ).rejects.toThrow(ValidationError);
  });

  it("throws NotFoundError if budget does not exist", async () => {
    const purchaseRepo = new PurchaseRepository();
    const budgetRepo = new BudgetRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(budgetRepo, "findById").mockResolvedValue(null);

    const service = new RecordPurchaseService(purchaseRepo, budgetRepo, memberRepo);

    await expect(
      service.execute({
        budgetId: "nonexistent",
        userId: "user-1",
        amount: 50,
        purchaseDate: "2026-06-10",
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws ForbiddenError if user is not a household member", async () => {
    const purchaseRepo = new PurchaseRepository();
    const budgetRepo = new BudgetRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(budgetRepo, "findById").mockResolvedValue(mockBudget as never);
    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue(null);

    const service = new RecordPurchaseService(purchaseRepo, budgetRepo, memberRepo);

    await expect(
      service.execute({
        budgetId: "budget-1",
        userId: "user-2",
        amount: 50,
        purchaseDate: "2026-06-10",
      }),
    ).rejects.toThrow(ForbiddenError);
  });
});
