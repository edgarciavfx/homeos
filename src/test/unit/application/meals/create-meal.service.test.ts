import { describe, it, expect, vi } from "vitest";
import { CreateMealService } from "@/application/meals/create-meal.service";
import { MealRepository } from "@/infrastructure/repositories/meal.repository";
import { HouseholdMemberRepository } from "@/infrastructure/repositories/household-member.repository";
import { ValidationError, ForbiddenError } from "@/lib/api/api-error";

vi.mock("@/infrastructure/prisma/transaction-manager", () => ({
  transaction: vi.fn((fn) => fn({})),
}));

describe("CreateMealService", () => {
  const mockMeal = {
    id: "meal-1",
    householdId: "hh-1",
    name: "Spaghetti Bolognese",
    preparationMinutes: 45,
    archived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ingredients: [],
  };

  it("creates a meal successfully", async () => {
    const mealRepo = new MealRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue({
      id: "mem-1",
      householdId: "hh-1",
      userId: "user-1",
      role: "MEMBER",
      joinedAt: new Date(),
    } as never);

    vi.spyOn(mealRepo, "create").mockResolvedValue(mockMeal);

    const service = new CreateMealService(mealRepo, memberRepo);
    const result = await service.execute({
      householdId: "hh-1",
      userId: "user-1",
      name: "Spaghetti Bolognese",
      preparationMinutes: 45,
    });

    expect(result.id).toBe("meal-1");
    expect(result.name).toBe("Spaghetti Bolognese");
    expect(result.preparationMinutes).toBe(45);
    expect(result.archived).toBe(false);
  });

  it("throws ForbiddenError when user is not a household member", async () => {
    const mealRepo = new MealRepository();
    const memberRepo = new HouseholdMemberRepository();

    vi.spyOn(memberRepo, "findByUserAndHousehold").mockResolvedValue(null);
    vi.spyOn(mealRepo, "create").mockResolvedValue(mockMeal);

    const service = new CreateMealService(mealRepo, memberRepo);

    await expect(
      service.execute({
        householdId: "hh-1",
        userId: "stranger",
        name: "Pizza",
        preparationMinutes: 30,
      }),
    ).rejects.toThrow(ForbiddenError);
  });

  it("throws ValidationError for empty name", async () => {
    const mealRepo = new MealRepository();
    const memberRepo = new HouseholdMemberRepository();

    const service = new CreateMealService(mealRepo, memberRepo);

    await expect(
      service.execute({
        householdId: "hh-1",
        userId: "user-1",
        name: "",
        preparationMinutes: 30,
      }),
    ).rejects.toThrow(ValidationError);
  });

  it("throws ValidationError for non-positive preparation time", async () => {
    const mealRepo = new MealRepository();
    const memberRepo = new HouseholdMemberRepository();

    const service = new CreateMealService(mealRepo, memberRepo);

    await expect(
      service.execute({
        householdId: "hh-1",
        userId: "user-1",
        name: "Salad",
        preparationMinutes: 0,
      }),
    ).rejects.toThrow(ValidationError);
  });
});
