import { describe, it, expect } from "vitest";
import {
  scorePriorities,
  PriorityInput,
} from "@/infrastructure/recommendations/recommendation-engine";
import { RECOMMENDATION_PERFORMANCE_TARGET_MS } from "@/lib/constants";

describe("Weekly Plan Generation Performance", () => {
  it("completes under performance target for 100+ inputs (BR-016)", () => {
    const inputs: PriorityInput[] = Array.from({ length: 120 }, (_, i) => ({
      title: `Task ${i}`,
      isOverdue: i % 3 === 0,
      isDueSoon: i % 2 === 0,
      isUnassigned: i % 4 === 0,
      isBudgetExceeded: i % 5 === 0,
    }));

    const start = performance.now();
    const result = scorePriorities(inputs);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(RECOMMENDATION_PERFORMANCE_TARGET_MS);
    expect(result.length).toBe(inputs.length);
    expect(result[0].priorityScore).toBeGreaterThanOrEqual(result[result.length - 1].priorityScore);
  });

  it("handles empty input", () => {
    const result = scorePriorities([]);
    expect(result).toEqual([]);
  });

  it("handles single input", () => {
    const inputs: PriorityInput[] = [
      {
        title: "Only Task",
        isOverdue: true,
        isDueSoon: false,
        isUnassigned: true,
        isBudgetExceeded: false,
      },
    ];

    const result = scorePriorities(inputs);

    expect(result.length).toBe(1);
    expect(result[0].priorityScore).toBe(125);
  });
});
