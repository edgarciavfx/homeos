import { describe, it, expect, vi } from "vitest";
import { GenerateGroceryListService } from "@/application/groceries/generate-grocery-list.service";
import { GroceryListRepository } from "@/infrastructure/repositories/grocery-list.repository";
import { GroceryItemRepository } from "@/infrastructure/repositories/grocery-item.repository";
import { ScheduledMealRepository } from "@/infrastructure/repositories/scheduled-meal.repository";
import { WeeklyPlanRepository } from "@/infrastructure/repositories/weekly-plan.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { ForbiddenError, NotFoundError } from "@/lib/api/api-error";

vi.mock("@/infrastructure/prisma/transaction-manager", () => ({
  transaction: vi.fn((fn) => fn({})),
}));

describe("GenerateGroceryListService", () => {
  const mockMeal = {
    id: "meal-1",
    name: "Spaghetti Bolognese",
    preparationMinutes: 45,
    archived: false,
    householdId: "hh-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockIngredients = [
    { id: "ing-1", mealId: "meal-1", name: "Pasta", quantity: 0.5, unit: "kg" },
    { id: "ing-2", mealId: "meal-1", name: "Tomato Sauce", quantity: 2, unit: "cups" },
    { id: "ing-3", mealId: "meal-1", name: "Ground Beef", quantity: 1, unit: "kg" },
  ];

  const mockScheduledMeal = {
    id: "sm-1",
    weeklyPlanId: "wp-1",
    mealId: "meal-1",
    scheduledDate: new Date("2026-06-15"),
    meal: { ...mockMeal, ingredients: mockIngredients },
  };

  const mockPlan = {
    id: "wp-1",
    householdId: "hh-1",
    weekStartDate: new Date("2026-06-15"),
    status: "DRAFT" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    priorities: [],
    scheduledMeals: [mockScheduledMeal],
  };

  const mockMembership = {
    id: "mem-1",
    householdId: "hh-1",
    userId: "user-1",
    role: "MEMBER" as const,
    joinedAt: new Date(),
  };

  it("generates a grocery list from scheduled meals", async () => {
    const groceryListRepo = new GroceryListRepository();
    const groceryItemRepo = new GroceryItemRepository();
    const scheduledMealRepo = new ScheduledMealRepository();
    const weeklyPlanRepo = new WeeklyPlanRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue(mockMembership as never);
    vi.spyOn(weeklyPlanRepo, "findById").mockResolvedValue(mockPlan as never);
    vi.spyOn(scheduledMealRepo, "findByWeeklyPlan").mockResolvedValue([mockScheduledMeal] as never);
    vi.spyOn(groceryListRepo, "findByWeeklyPlan").mockResolvedValue(null);
    vi.spyOn(groceryListRepo, "create").mockResolvedValue({
      id: "gl-1",
      householdId: "hh-1",
      weeklyPlanId: "wp-1",
      generatedAt: new Date(),
      items: [],
    } as never);
    vi.spyOn(groceryItemRepo, "createMany").mockResolvedValue({ count: 3 } as never);

    const service = new GenerateGroceryListService(
      groceryListRepo,
      groceryItemRepo,
      scheduledMealRepo,
      weeklyPlanRepo,
      memberRepo,
    );

    const result = await service.execute({
      householdId: "hh-1",
      weeklyPlanId: "wp-1",
      userId: "user-1",
    });

    expect(result.groceryListId).toBe("gl-1");
    expect(result.itemCount).toBe(3);
    expect(groceryItemRepo.createMany).toHaveBeenCalled();
  });

  it("preserves manual items when regenerating", async () => {
    const groceryListRepo = new GroceryListRepository();
    const groceryItemRepo = new GroceryItemRepository();
    const scheduledMealRepo = new ScheduledMealRepository();
    const weeklyPlanRepo = new WeeklyPlanRepository();
    const memberRepo = new HouseholdMemberRepository();

    const existingList = {
      id: "gl-1",
      householdId: "hh-1",
      weeklyPlanId: "wp-1",
      generatedAt: new Date(),
      items: [
        {
          id: "manual-1",
          groceryListId: "gl-1",
          name: "Milk",
          quantity: 2,
          unit: "liter",
          category: "Dairy",
          completed: false,
          source: "MANUAL" as const,
          createdAt: new Date(),
        },
        {
          id: "gen-1",
          groceryListId: "gl-1",
          name: "Pasta",
          quantity: 0.5,
          unit: "kg",
          category: null,
          completed: false,
          source: "GENERATED" as const,
          createdAt: new Date(),
        },
      ],
    };

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue(mockMembership as never);
    vi.spyOn(weeklyPlanRepo, "findById").mockResolvedValue(mockPlan as never);
    vi.spyOn(scheduledMealRepo, "findByWeeklyPlan").mockResolvedValue([mockScheduledMeal] as never);
    vi.spyOn(groceryListRepo, "findByWeeklyPlan").mockResolvedValue(existingList as never);
    vi.spyOn(groceryItemRepo, "deleteGeneratedByList").mockResolvedValue({ count: 1 } as never);
    vi.spyOn(groceryItemRepo, "createMany").mockResolvedValue({ count: 1 } as never);

    const service = new GenerateGroceryListService(
      groceryListRepo,
      groceryItemRepo,
      scheduledMealRepo,
      weeklyPlanRepo,
      memberRepo,
    );

    const result = await service.execute({
      householdId: "hh-1",
      weeklyPlanId: "wp-1",
      userId: "user-1",
    });

    expect(result.groceryListId).toBe("gl-1");
    expect(groceryItemRepo.deleteGeneratedByList).toHaveBeenCalledWith("gl-1", expect.anything());
  });

  it("throws ForbiddenError when user is not a member", async () => {
    const groceryListRepo = new GroceryListRepository();
    const groceryItemRepo = new GroceryItemRepository();
    const scheduledMealRepo = new ScheduledMealRepository();
    const weeklyPlanRepo = new WeeklyPlanRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue(null as never);

    const service = new GenerateGroceryListService(
      groceryListRepo,
      groceryItemRepo,
      scheduledMealRepo,
      weeklyPlanRepo,
      memberRepo,
    );

    await expect(
      service.execute({
        householdId: "hh-1",
        weeklyPlanId: "wp-1",
        userId: "stranger",
      }),
    ).rejects.toThrow(ForbiddenError);
  });

  it("throws NotFoundError when weekly plan does not exist", async () => {
    const groceryListRepo = new GroceryListRepository();
    const groceryItemRepo = new GroceryItemRepository();
    const scheduledMealRepo = new ScheduledMealRepository();
    const weeklyPlanRepo = new WeeklyPlanRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue(mockMembership as never);
    vi.spyOn(weeklyPlanRepo, "findById").mockResolvedValue(null as never);

    const service = new GenerateGroceryListService(
      groceryListRepo,
      groceryItemRepo,
      scheduledMealRepo,
      weeklyPlanRepo,
      memberRepo,
    );

    await expect(
      service.execute({
        householdId: "hh-1",
        weeklyPlanId: "wp-1",
        userId: "user-1",
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it("handles empty scheduled meals gracefully", async () => {
    const groceryListRepo = new GroceryListRepository();
    const groceryItemRepo = new GroceryItemRepository();
    const scheduledMealRepo = new ScheduledMealRepository();
    const weeklyPlanRepo = new WeeklyPlanRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue(mockMembership as never);
    vi.spyOn(weeklyPlanRepo, "findById").mockResolvedValue(mockPlan as never);
    vi.spyOn(scheduledMealRepo, "findByWeeklyPlan").mockResolvedValue([] as never);
    vi.spyOn(groceryListRepo, "findByWeeklyPlan").mockResolvedValue(null as never);
    vi.spyOn(groceryListRepo, "create").mockResolvedValue({
      id: "gl-1",
      householdId: "hh-1",
      weeklyPlanId: "wp-1",
      generatedAt: new Date(),
      items: [],
    } as never);

    const service = new GenerateGroceryListService(
      groceryListRepo,
      groceryItemRepo,
      scheduledMealRepo,
      weeklyPlanRepo,
      memberRepo,
    );

    const result = await service.execute({
      householdId: "hh-1",
      weeklyPlanId: "wp-1",
      userId: "user-1",
    });

    expect(result.groceryListId).toBe("gl-1");
    expect(result.itemCount).toBe(0);
  });
});
