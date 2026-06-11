# HOS - Query Layer & Read Model Specification

Version: 1.0
Status: Approved for MVP Implementation
Phase: Read Architecture

---

# Purpose

Defines the Query Layer responsible for building frontend read models.

Commands change state.

Queries return view models.

---

# Architecture

Route Handler

↓

Query Service

↓

Repositories

↓

Database

---

# Query Service Rules

Query Services:

- Read-only
- No transactions
- No business mutations
- Return View Models
- May aggregate multiple repositories

---

# Query Folder Structure

src/application/queries

```
queries/

dashboard/
planning/
meals/
groceries/
chores/
budgets/
```

# Dashboard Queries

## GetDashboardSummaryQuery

Purpose:

Build dashboard view.

### Output

```
interface DashboardSummaryView {  householdName: string;  weeklyPlan: WeeklyPlanSummaryView;  upcomingMeals: UpcomingMealView[];  groceryProgress: GroceryProgressView;  overdueChores: OverdueChoreView[];  budgetSnapshot: BudgetSnapshotView;}
```

### Data Sources

- WeeklyPlanRepository
- ScheduledMealRepository
- GroceryRepository
- ChoreRepository
- BudgetRepository

---

# Planning Queries

## GetCurrentWeeklyPlanQuery

Output:

```
interface CurrentWeeklyPlanView {  id: string;  status: string;  priorities: PriorityView[];  meals: ScheduledMealView[];}
```

---

# Meal Queries

## GetMealLibraryQuery

Output:

```
interface MealLibraryView {  meals: MealSummaryView[];}
```

Supports:

- Pagination
- Archived filtering

---

## GetMealRecommendationsQuery

Output:

```
interface MealRecommendationView {  mealId: string;  mealName: string;  score: number;}
```

---

# Grocery Queries

## GetCurrentGroceryListQuery

Output:

```
interface GroceryListView {  id: string;  generatedItems: GroceryItemView[];  manualItems: GroceryItemView[];  completionPercentage: number;}
```

---

# Chore Queries

## GetOverdueChoresQuery

Output:

```
interface OverdueChoreView {  occurrenceId: string;  choreName: string;  ownerName?: string;  dueDate: Date;}
```

---

# Budget Queries

## GetBudgetSummaryQuery

Output:

```
interface BudgetSummaryView {  amount: number;  spent: number;  remaining: number;  isOverBudget: boolean;}
```

---

# Frontend Alignment

Dashboard

GET /dashboard

Planning

GET /planning/current

Meals

GET /meals

GET /meal-recommendations

Groceries

GET /groceries/current

Chores

GET /chores/overdue

Budget

GET /budgets/current

These endpoints return View Models rather than raw entities.

---

# Query DTO Location

src/types/views

```
dashboard.view.tsplanning.view.tsmeal.view.tsgrocery.view.tschore.view.tsbudget.view.ts
```

Never expose Prisma models directly.

Never expose database entities directly.

---

# Repository Usage

Allowed:

```
weeklyPlanRepository.findCurrent()budgetRepository.findCurrent()choreRepository.findOverdue()
```

Query services may compose multiple repositories.

---

# Performance Rules

Dashboard query target:

< 500ms

Recommendation queries:

< 3s

Budget queries:

< 250ms