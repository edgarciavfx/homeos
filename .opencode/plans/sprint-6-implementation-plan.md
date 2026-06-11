# Sprint 6 — Budgeting & Dashboard Implementation Plan

## Overview

Complete financial tracking (Budget + Purchase) and executive overview (Dashboard).

## Branch

`sprint-6-budgeting-dashboard` (already created from `main`)

---

## Step 1 — API Routes

### 1a. Add GET handler to `src/app/api/v1/households/[householdId]/budgets/route.ts`

Add import for `GetBudgetSummaryQuery` and a `GET` export that returns the current month budget summary:

```typescript
import { GetBudgetSummaryQuery } from "@/application/queries/budgets/get-budget-summary.query";
import { PurchaseRepository } from "@/infrastructure/repositories/purchase.repository";

const getBudgetSummaryQuery = new GetBudgetSummaryQuery(
  new BudgetRepository(),
  new PurchaseRepository(),
);

export const GET = protectedRoute(async (_req, { params }) => {
  const { householdId } = await params;
  const result = await getBudgetSummaryQuery.execute(householdId);
  return ok(result);
});
```

### 1b. Create `src/app/api/v1/households/[householdId]/dashboard/route.ts`

New file with a GET handler using `GetDashboardSummaryQuery`:

```typescript
import { protectedRoute } from "@/lib/api/api-handler";
import { ok } from "@/lib/api/api-response";
import { GetDashboardSummaryQuery } from "@/application/queries/dashboard/get-dashboard-summary.query";
import { WeeklyPlanRepository } from "@/infrastructure/repositories/weekly-plan.repository";
import { ScheduledMealRepository } from "@/infrastructure/repositories/scheduled-meal.repository";
import { GroceryListRepository } from "@/infrastructure/repositories/grocery-list.repository";
import { ChoreOccurrenceRepository } from "@/infrastructure/repositories/chore-occurrence.repository";
import { BudgetRepository } from "@/infrastructure/repositories/budget.repository";
import { HouseholdRepository } from "@/infrastructure/repositories/household.repository";

const query = new GetDashboardSummaryQuery(
  new HouseholdRepository(),
  new WeeklyPlanRepository(),
  new ScheduledMealRepository(),
  new GroceryListRepository(),
  new ChoreOccurrenceRepository(),
  new BudgetRepository(),
);

export const GET = protectedRoute(async (_req, { params }) => {
  const { householdId } = await params;
  const result = await query.execute(householdId);
  return ok(result);
});
```

### 1c. Fix `src/application/queries/dashboard/get-dashboard-summary.query.ts`

Change lines 74-79 to calculate actual spent via `sumByBudget`:

```typescript
budgetSnapshot: budget
  ? {
      amount: Number(budget.amount),
      spent: budget.purchases.reduce((sum, p) => sum + Number(p.amount), 0),
      remaining: Number(budget.amount) - budget.purchases.reduce((sum, p) => sum + Number(p.amount), 0),
    }
  : null,
```

---

## Step 2 — Frontend Hooks

### 2a. Create `src/hooks/use-budgets.ts`

```typescript
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useBudget(householdId: string | null) {
  return useQuery({
    queryKey: ["budget", householdId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/households/${householdId}/budgets`);
      if (!res.ok) throw new Error("Failed to fetch budget");
      const json = await res.json();
      return json.data;
    },
    enabled: !!householdId,
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      householdId,
      month,
      year,
      amount,
    }: {
      householdId: string;
      month: number;
      year: number;
      amount: number;
    }) => {
      const res = await fetch(`/api/v1/households/${householdId}/budgets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year, amount }),
      });
      if (!res.ok) throw new Error("Failed to create budget");
      return (await res.json()).data;
    },
    onSuccess: (_, { householdId }) => {
      qc.invalidateQueries({ queryKey: ["budget", householdId] });
    },
  });
}

export function usePurchases(budgetId: string | null) {
  return useQuery({
    queryKey: ["purchases", budgetId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/budgets/${budgetId}/purchases`);
      if (!res.ok) throw new Error("Failed to fetch purchases");
      return (await res.json()).data;
    },
    enabled: !!budgetId,
  });
}

export function useRecordPurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      budgetId,
      amount,
      purchaseDate,
      notes,
    }: {
      budgetId: string;
      amount: number;
      purchaseDate: string;
      notes?: string;
    }) => {
      const res = await fetch(`/api/v1/budgets/${budgetId}/purchases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, purchaseDate, notes }),
      });
      if (!res.ok) throw new Error("Failed to record purchase");
      return (await res.json()).data;
    },
    onSuccess: (_, { budgetId }) => {
      qc.invalidateQueries({ queryKey: ["purchases", budgetId] });
      qc.invalidateQueries({ queryKey: ["budget"] });
    },
  });
}
```

### 2b. Create `src/hooks/use-dashboard.ts`

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";

export function useDashboardSummary(householdId: string | null) {
  return useQuery({
    queryKey: ["dashboard", householdId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/households/${householdId}/dashboard`);
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return (await res.json()).data;
    },
    enabled: !!householdId,
  });
}
```

---

## Step 3 — Budget Components

### 3a. `src/components/budget/budget-summary-card.tsx`

Show budget amount, spent, remaining with progress bar. Handle loading (skeleton), empty (no budget message), over-budget (red warning), and normal states.

### 3b. `src/components/budget/budget-form.tsx`

React Hook Form + Zod. Fields: month (select 1–12), year (number), amount (number). Validates via `CreateBudgetSchema`. Shows form validation errors.

### 3c. `src/components/budget/purchase-table.tsx`

Table of purchases: date, amount, notes columns. Loading → skeletons. Empty → "No purchases recorded." Data → table rows.

### 3d. `src/components/budget/purchase-form.tsx`

React Hook Form + Zod. Fields: amount, purchaseDate (date input), notes. Submits via `useRecordPurchase()`. Shows inline errors.

---

## Step 4 — Dashboard Components

Each card follows the same pattern:

- Accept `householdId` prop
- Use `useDashboardSummary(householdId)` to get data
- Show skeleton on loading
- Show content on data
- Handle null/missing data gracefully

### 4a. `src/components/dashboard/weekly-plan-summary-card.tsx`

- Plan status badge (DRAFT / APPROVED)
- Priority count
- Link to `/planning`

### 4b. `src/components/dashboard/upcoming-meals-card.tsx`

- List meals with dates
- Empty: "No meals scheduled"

### 4c. `src/components/dashboard/grocery-progress-card.tsx`

- `purchasedCount` / `purchasedCount + remainingCount`
- Progress bar
- Empty: "No grocery list"

### 4d. `src/components/dashboard/overdue-chores-card.tsx`

- List overdue chores count + first few names
- Link to `/chores`
- Empty: "No overdue chores"

### 4e. `src/components/dashboard/budget-snapshot-card.tsx`

- Amount / Spent / Remaining
- Progress bar
- Over-budget red indicator
- Link to `/budget`

---

## Step 5 — Page Rewrites

### 5a. `src/app/dashboard/page.tsx`

- Get `householdId` from `useHousehold()`
- Get dashboard data from `useDashboardSummary(householdId)`
- Render 5 cards in `grid gap-4 md:grid-cols-2 lg:grid-cols-3`
- Full-page loading skeleton
- No-household empty state

### 5b. `src/app/budget/page.tsx`

- Get `householdId` from `useHousehold()`
- Get budget data from `useBudget(householdId)`
- If no budget → show `BudgetForm`
- If has budget → show `BudgetSummaryCard` + `PurchaseTable` + `PurchaseForm`
- Get `budgetId` from budget data for purchases

---

## Step 6 — App Shell Update

### `src/components/app-shell.tsx`

Add between Chores and Settings:

```tsx
<Link href="/budget" className="...">
  Budget
</Link>
```

---

## Step 7 — Tests

### 7a. Unit: `src/test/unit/application/budgets/create-budget.service.test.ts`

- Mock BudgetRepository + HouseholdMemberRepository
- Test: creates budget successfully
- Test: throws on invalid input
- Test: throws if not household member
- Test: throws if not owner/manager

### 7b. Unit: `src/test/unit/application/budgets/record-purchase.service.test.ts`

- Mock PurchaseRepository + BudgetRepository + HouseholdMemberRepository
- Test: records purchase successfully
- Test: throws on invalid input
- Test: throws if budget not found
- Test: throws if not household member

### 7c. Integration: `src/test/integration/budgets/budget-api.test.ts`

- Test: POST + GET budget summary
- Test: GET 401 without auth
- Test: POST + GET purchases

---

## Step 8 — Git Workflow

```bash
git add .
git commit -m "Sprint 6 — Budgeting & Dashboard (#10)"
git push -u origin sprint-6-budgeting-dashboard
# Create PR via gh
gh pr create --title "Sprint 6 — Budgeting & Dashboard" --body "..."
# Merge PR
gh pr merge --squash
# Cleanup
git checkout main
git pull
git branch -d sprint-6-budgeting-dashboard
```

---

## Files Modified Summary

| Action  | File                                                                |
| ------- | ------------------------------------------------------------------- |
| Modify  | `src/app/api/v1/households/[householdId]/budgets/route.ts`          |
| Create  | `src/app/api/v1/households/[householdId]/dashboard/route.ts`        |
| Modify  | `src/application/queries/dashboard/get-dashboard-summary.query.ts`  |
| Create  | `src/hooks/use-budgets.ts`                                          |
| Create  | `src/hooks/use-dashboard.ts`                                        |
| Create  | `src/components/budget/budget-summary-card.tsx`                     |
| Create  | `src/components/budget/budget-form.tsx`                             |
| Create  | `src/components/budget/purchase-table.tsx`                          |
| Create  | `src/components/budget/purchase-form.tsx`                           |
| Create  | `src/components/dashboard/weekly-plan-summary-card.tsx`             |
| Create  | `src/components/dashboard/upcoming-meals-card.tsx`                  |
| Create  | `src/components/dashboard/grocery-progress-card.tsx`                |
| Create  | `src/components/dashboard/overdue-chores-card.tsx`                  |
| Create  | `src/components/dashboard/budget-snapshot-card.tsx`                 |
| Rewrite | `src/app/dashboard/page.tsx`                                        |
| Rewrite | `src/app/budget/page.tsx`                                           |
| Modify  | `src/components/app-shell.tsx`                                      |
| Create  | `src/test/unit/application/budgets/create-budget.service.test.ts`   |
| Create  | `src/test/unit/application/budgets/record-purchase.service.test.ts` |
| Create  | `src/test/integration/budgets/budget-api.test.ts`                   |
