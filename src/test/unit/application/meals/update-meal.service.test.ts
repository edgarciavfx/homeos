import { describe, it, expect, vi } from "vitest";
import { UpdateMealService } from "@/application/meals/update-meal.service";
import { MealRepository } from "@/infrastructure/repositories/meal.repository";
import { NotFoundError } from "@/lib/api/api-error";

vi.mock("@/infrastructure/prisma/transaction-manager", () => ({
  transaction: vi.fn((fn) => fn({})),
}));

describe("UpdateMealService", () => {
  const activeMeal = {
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

  const archivedMeal = {
    ...activeMeal,
    archived: true,
  };

  it("updates a meal successfully", async () => {
    const mealRepo = new MealRepository();

    vi.spyOn(mealRepo, "findById").mockResolvedValue(activeMeal);
    vi.spyOn(mealRepo, "update").mockResolvedValue({
      ...activeMeal,
      name: "Updated Meal",
      preparationMinutes: 60,
    });

    const service = new UpdateMealService(mealRepo);
    const result = await service.execute({
      mealId: "meal-1",
      name: "Updated Meal",
      preparationMinutes: 60,
    });

    expect(result.name).toBe("Updated Meal");
    expect(result.preparationMinutes).toBe(60);
    expect(mealRepo.update).toHaveBeenCalledWith(
      "meal-1",
      { name: "Updated Meal", preparationMinutes: 60 },
      expect.anything(),
    );
  });

  it("throws NotFoundError when meal does not exist", async () => {
    const mealRepo = new MealRepository();

    vi.spyOn(mealRepo, "findById").mockResolvedValue(null);

    const service = new UpdateMealService(mealRepo);

    await expect(
      service.execute({ mealId: "nonexistent", name: "Ghost Meal" }),
    ).rejects.toThrow(NotFoundError);
  });

  it("throws error when updating an archived meal", async () => {
    const mealRepo = new MealRepository();

    vi.spyOn(mealRepo, "findById").mockResolvedValue(archivedMeal);

    const service = new UpdateMealService(mealRepo);

    await expect(
      service.execute({ mealId: "meal-1", name: "Archived Edit" }),
    ).rejects.toThrow("Archived meals cannot be edited");
  });

  it("allows partial update with only name", async () => {
    const mealRepo = new MealRepository();

    vi.spyOn(mealRepo, "findById").mockResolvedValue(activeMeal);
    vi.spyOn(mealRepo, "update").mockResolvedValue({
      ...activeMeal,
      name: "Just Renamed",
    });

    const service = new UpdateMealService(mealRepo);
    const result = await service.execute({ mealId: "meal-1", name: "Just Renamed" });

    expect(result.name).toBe("Just Renamed");
    expect(mealRepo.update).toHaveBeenCalledWith(
      "meal-1",
      { name: "Just Renamed", preparationMinutes: undefined },
      expect.anything(),
    );
  });
});
