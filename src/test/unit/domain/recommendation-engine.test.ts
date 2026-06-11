import { describe, it, expect } from "vitest";
import { scorePriorities } from "@/infrastructure/recommendations/recommendation-engine";

describe("RecommendationEngine", () => {
  it("gives overdue chores the highest score", () => {
    const result = scorePriorities([
      { title: "Clean Bathroom", isOverdue: true, isDueSoon: false, isUnassigned: false, isBudgetExceeded: false },
      { title: "Normal Task", isOverdue: false, isDueSoon: false, isUnassigned: false, isBudgetExceeded: false },
    ]);
    expect(result[0].priorityScore).toBeGreaterThan(result[1].priorityScore);
  });

  it("scores due-soon tasks higher than normal tasks", () => {
    const result = scorePriorities([
      { title: "Due Soon", isOverdue: false, isDueSoon: true, isUnassigned: false, isBudgetExceeded: false },
      { title: "Normal", isOverdue: false, isDueSoon: false, isUnassigned: false, isBudgetExceeded: false },
    ]);
    expect(result[0].priorityScore).toBeGreaterThan(result[1].priorityScore);
  });

  it("adds budget exceeded score", () => {
    const result = scorePriorities([
      { title: "Budget Issue", isOverdue: false, isDueSoon: false, isUnassigned: false, isBudgetExceeded: true },
      { title: "Normal", isOverdue: false, isDueSoon: false, isUnassigned: false, isBudgetExceeded: false },
    ]);
    expect(result[0].priorityScore).toBe(40);
  });

  it("adds unassigned penalty", () => {
    const result = scorePriorities([
      { title: "Unassigned", isOverdue: false, isDueSoon: false, isUnassigned: true, isBudgetExceeded: false },
    ]);
    expect(result[0].priorityScore).toBe(25);
  });

  it("sorts recommendations descending by score", () => {
    const result = scorePriorities([
      { title: "Low", isOverdue: false, isDueSoon: false, isUnassigned: false, isBudgetExceeded: false },
      { title: "High", isOverdue: true, isDueSoon: false, isUnassigned: false, isBudgetExceeded: false },
    ]);
    expect(result[0].title).toBe("High");
    expect(result[1].title).toBe("Low");
  });
});
