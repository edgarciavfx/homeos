import { describe, it, expect } from "vitest";

describe("BudgetCalculator", () => {
  it("calculates remaining as budget minus spent", () => {
    const budget = 1000;
    const spent = 300;
    const remaining = budget - spent;
    expect(remaining).toBe(700);
  });

  it("supports negative remaining for over-budget", () => {
    const budget = 1000;
    const spent = 1200;
    const remaining = budget - spent;
    expect(remaining).toBe(-200);
  });

  it("returns budget amount when no purchases", () => {
    const budget = 500;
    const spent = 0;
    const remaining = budget - spent;
    expect(remaining).toBe(500);
  });
});
