import { describe, it, expect } from "vitest";
import { scoreMeals } from "@/infrastructure/recommendations/meal-recommendation-engine";

describe("MealRecommendationEngine", () => {
  it("prioritizes frequently used meals", () => {
    const result = scoreMeals([
      { mealId: "1", mealName: "Tacos", preparationMinutes: 30, usageFrequency: 10, recentUsageCount: 0 },
      { mealId: "2", mealName: "Salad", preparationMinutes: 10, usageFrequency: 1, recentUsageCount: 0 },
    ]);
    expect(result[0].mealId).toBe("1");
  });

  it("penalizes recently used meals", () => {
    const result = scoreMeals([
      { mealId: "1", mealName: "Pasta", preparationMinutes: 30, usageFrequency: 5, recentUsageCount: 3 },
      { mealId: "2", mealName: "Curry", preparationMinutes: 30, usageFrequency: 5, recentUsageCount: 0 },
    ]);
    expect(result[0].mealId).toBe("2");
  });

  it("favors quick meals with a bonus", () => {
    const result = scoreMeals([
      { mealId: "1", mealName: "Quick Salad", preparationMinutes: 10, usageFrequency: 1, recentUsageCount: 0 },
      { mealId: "2", mealName: "Slow Roast", preparationMinutes: 120, usageFrequency: 1, recentUsageCount: 0 },
    ]);
    expect(result[0].mealId).toBe("1");
  });

  it("sorts descending by score", () => {
    const result = scoreMeals([
      { mealId: "1", mealName: "A", preparationMinutes: 30, usageFrequency: 1, recentUsageCount: 0 },
      { mealId: "2", mealName: "B", preparationMinutes: 30, usageFrequency: 10, recentUsageCount: 0 },
    ]);
    expect(result[0].mealId).toBe("2");
  });
});
