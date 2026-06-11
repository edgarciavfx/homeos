import { describe, it, expect } from "vitest";
import { aggregateIngredients } from "@/infrastructure/recommendations/ingredient-aggregator";

describe("IngredientAggregator", () => {
  it("merges duplicate ingredients", () => {
    const result = aggregateIngredients([
      { name: "Chicken Breast", quantity: 1, unit: "kg" },
      { name: "Chicken Breast", quantity: 0.5, unit: "kg" },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(1.5);
  });

  it("does not merge different units", () => {
    const result = aggregateIngredients([
      { name: "Milk", quantity: 1, unit: "liter" },
      { name: "Milk", quantity: 1, unit: "cup" },
    ]);
    expect(result).toHaveLength(2);
  });

  it("handles empty input", () => {
    const result = aggregateIngredients([]);
    expect(result).toHaveLength(0);
  });

  it("preserves unique ingredients", () => {
    const result = aggregateIngredients([
      { name: "Chicken", quantity: 1, unit: "kg" },
      { name: "Rice", quantity: 2, unit: "cups" },
    ]);
    expect(result).toHaveLength(2);
  });
});
