import { describe, it, expect, vi } from "vitest";
import { ArchiveMealService } from "@/application/meals/archive-meal.service";
import { MealRepository } from "@/infrastructure/repositories/meal.repository";
import { NotFoundError } from "@/lib/api/api-error";

vi.mock("@/infrastructure/prisma/transaction-manager", () => ({
  transaction: vi.fn((fn) => fn({})),
}));

describe("ArchiveMealService", () => {
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

  it("archives a meal successfully", async () => {
    const mealRepo = new MealRepository();

    vi.spyOn(mealRepo, "findById").mockResolvedValue(activeMeal);
    vi.spyOn(mealRepo, "archive").mockResolvedValue({
      ...activeMeal,
      archived: true,
    });

    const service = new ArchiveMealService(mealRepo);
    const result = await service.execute("meal-1");

    expect(result.archived).toBe(true);
    expect(mealRepo.archive).toHaveBeenCalledWith("meal-1", expect.anything());
  });

  it("throws NotFoundError when meal does not exist", async () => {
    const mealRepo = new MealRepository();

    vi.spyOn(mealRepo, "findById").mockResolvedValue(null);

    const service = new ArchiveMealService(mealRepo);

    await expect(service.execute("nonexistent")).rejects.toThrow(NotFoundError);
  });

  it("throws NotFoundError when meal is already archived", async () => {
    const mealRepo = new MealRepository();

    vi.spyOn(mealRepo, "findById").mockResolvedValue(null);

    const service = new ArchiveMealService(mealRepo);

    await expect(service.execute("unknown")).rejects.toThrow(NotFoundError);
    expect(mealRepo.findById).toHaveBeenCalledWith("unknown");
  });
});
