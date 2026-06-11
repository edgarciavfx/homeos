import { describe, it, expect } from "vitest";
import {
  scorePriorities,
  PriorityInput,
} from "@/infrastructure/recommendations/recommendation-engine";
import { RECOMMENDATION_PERFORMANCE_TARGET_MS } from "@/lib/constants";

describe("Meal Recommendation Performance", () => {
  it("completes under performance target", () => {
    const inputs: PriorityInput[] = Array.from({ length: 50 }, (_, i) => ({
      title: `Task ${i}`,
      isOverdue: i % 3 === 0,
      isDueSoon: i % 2 === 0,
      isUnassigned: i % 4 === 0,
      isBudgetExceeded: false,
    }));

    const start = performance.now();
    const result = scorePriorities(inputs);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(RECOMMENDATION_PERFORMANCE_TARGET_MS);
    expect(result.length).toBe(inputs.length);
  });

  it("handles empty input", () => {
    const result = scorePriorities([]);
    expect(result).toEqual([]);
  });
});
