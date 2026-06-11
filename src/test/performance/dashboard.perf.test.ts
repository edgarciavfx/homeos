import { describe, it, expect, vi } from "vitest";
import {
  aggregateIngredients,
  IngredientInput,
} from "@/infrastructure/recommendations/ingredient-aggregator";
import { DASHBOARD_PERFORMANCE_TARGET_MS } from "@/lib/constants";

describe("Dashboard Data Aggregation Performance", () => {
  it("aggregates ingredients under performance target", () => {
    const inputs: IngredientInput[] = Array.from({ length: 100 }, (_, i) => ({
      name: `ingredient-${i % 20}`,
      quantity: (i % 10) + 1,
      unit: i % 2 === 0 ? "pcs" : "g",
    }));

    const start = performance.now();
    const result = aggregateIngredients(inputs);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(DASHBOARD_PERFORMANCE_TARGET_MS);
    expect(result.length).toBeLessThanOrEqual(20);
  });
});
