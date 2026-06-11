# HOS - Frontend Architecture Specification

Version: 1.0  
Status: Approved for UI Development  
Phase: Frontend Architecture & UI Design

---

# Purpose

This document defines the frontend architecture for HomeOS MVP.

It provides:

- App Router structure
    
- Page responsibilities
    
- Component hierarchy
    
- Data dependencies
    
- Permission model
    
- Navigation strategy
    

Technology Stack:

- Next.js App Router
    
- TypeScript
    
- Shadcn/UI
    
- Tailwind CSS
    
- React Query (TanStack Query)
    
- Auth.js
    

---

# Application Structure

```text
/app

├── (auth)
│   ├── login
│   └── register
│
├── dashboard
│
├── planning
│
├── meals
│   ├── page.tsx
│   ├── create
│   └── [mealId]
│
├── groceries
│
├── chores
│
├── budget
│
├── settings
│
├── layout.tsx
└── page.tsx
```

---

# Global Layout

## Purpose

Provide consistent navigation and household context.

## Components

### AppShell

Contains:

- Top Navigation
    
- Mobile Bottom Navigation
    
- Household Selector
    
- User Menu
    

### HouseholdContextProvider

Provides:

- Current Household
    
- Current User Role
    
- Active Permissions
    

### NotificationProvider

Provides:

- Toasts
    
- Validation Errors
    
- Success Messages
    

---

# /dashboard

## Purpose

Central household overview.

Acts as the primary landing page after login.

Provides visibility into:

- Current week
    
- Upcoming meals
    
- Grocery progress
    
- Overdue chores
    
- Budget status
    

Related Requirements:

- FR-005
    
- FR-020
    
- FR-025
    

## Components

### DashboardHeader

Displays:

- Household Name
    
- Current Week
    

### WeeklyPlanSummaryCard

Displays:

- Current Plan Status
    
- Active Priorities
    

### UpcomingMealsCard

Displays:

- Next Scheduled Meals
    

### GroceryProgressCard

Displays:

- Purchased vs Remaining Items
    

### OverdueChoresCard

Displays:

- Overdue Chores
    

### BudgetSnapshotCard

Displays:

- Monthly Budget
    
- Remaining Budget
    

## Data Dependencies

```text
GET /api/planning/current

GET /api/meals/scheduled

GET /api/groceries/current

GET /api/chores/overdue

GET /api/budgets/current
```

## Permissions

OWNER

- View
    

MEMBER

- View
    

---

# /planning

## Purpose

Manage weekly planning sessions.

Core workflow of HomeOS MVP.

Related Requirements:

- FR-004 through FR-008
    

## Components

### PlanningHeader

### PlanningInputsPanel

Displays:

- Overdue Chores
    
- Budget Status
    
- Ownership Assignments
    
- Existing Meal Plan
    

### RecommendationPanel

Displays:

- Generated Priorities
    
- Suggested Owners
    
- Suggested Dates
    

### WeeklyPriorityEditor

Allows:

- Create
    
- Edit
    
- Delete
    

### WeeklyPlanActions

Allows:

- Generate Recommendations
    
- Save Plan
    

## Data Dependencies

```text
GET /api/planning/current

POST /api/planning/recommendations

PUT /api/planning/current

GET /api/chores

GET /api/budgets/current

GET /api/ownership
```

## Permissions

OWNER

- View
    
- Edit
    
- Save Plan
    

MEMBER

- View
    
- Edit
    
- Save Plan
    

---

# /meals

## Purpose

Manage reusable meal catalog and weekly meal schedules.

Related Requirements:

- FR-009 through FR-013
    

## Components

### MealLibraryTable

Displays:

- Meal Name
    
- Preparation Time
    

### MealForm

Supports:

- Create Meal
    
- Edit Meal
    

### IngredientEditor

Supports:

- Add Ingredient
    
- Update Ingredient
    
- Remove Ingredient
    

### WeeklyMealCalendar

Displays:

- Scheduled Meals
    

### MealRecommendationPanel

Displays:

- Suggested Meals
    

## Data Dependencies

```text
GET /api/meals

POST /api/meals

PUT /api/meals/:id

DELETE /api/meals/:id

GET /api/planning/current/meals

POST /api/meals/recommendations
```

## Permissions

OWNER

- Full Access
    

MEMBER

- Full Access
    

---

# /groceries

## Purpose

Manage grocery planning and shopping execution.

Related Requirements:

- FR-014 through FR-017
    

## Components

### GroceryListHeader

### GroceryListView

Displays:

- Generated Items
    
- Manual Items
    

### GroceryItemRow

Supports:

- Complete Item
    
- Edit Item
    

### AddManualItemDialog

Supports:

- Manual Entry
    

### ShoppingProgressBar

Displays:

- Completion %
    

## Data Dependencies

```text
GET /api/groceries/current

POST /api/groceries/generate

POST /api/groceries/items

PATCH /api/groceries/items/:id
```

## Permissions

OWNER

- Full Access
    

MEMBER

- Full Access
    

---

# /chores

## Purpose

Manage recurring household responsibilities.

Related Requirements:

- FR-018 through FR-021
    

## Components

### ChoreList

Displays:

- Active Chores
    
- Frequency
    
- Owner
    

### ChoreForm

Supports:

- Create Chore
    
- Edit Chore
    

### ChoreOccurrenceTable

Displays:

- Due Date
    
- Status
    

### OwnershipSelector

Assigns:

- Household Member
    

### OverdueIndicator

Displays:

- Due
    
- Overdue
    

## Data Dependencies

```text
GET /api/chores

POST /api/chores

PUT /api/chores/:id

GET /api/chores/occurrences

PATCH /api/chores/:id/owner
```

## Permissions

OWNER

- Full Access
    

MEMBER

- Full Access
    

---

# /budget

## Purpose

Track food spending and budget adherence.

Related Requirements:

- FR-022 through FR-025
    

## Components

### BudgetSummaryCard

Displays:

- Budget
    
- Remaining
    
- Spent
    

### BudgetForm

Supports:

- Create Budget
    
- Edit Budget
    

### PurchaseTable

Displays:

- Purchase History
    

### PurchaseForm

Supports:

- Record Purchase
    

### SpendingTrendCard

Displays:

- Monthly Spending History
    

## Data Dependencies

```text
GET /api/budgets/current

POST /api/budgets

PUT /api/budgets/:id

GET /api/purchases

POST /api/purchases
```

## Permissions

OWNER

- Full Access
    

MEMBER

- View
    
- Create Purchases
    

MEMBER cannot:

- Create Budget
    
- Modify Budget
    

---

# /settings

## Purpose

Household administration and profile management.

Related Requirements:

- FR-001
    
- FR-002
    
- FR-003
    

## Components

### HouseholdSettingsCard

Supports:

- Rename Household
    

### MemberManagementTable

Displays:

- Members
    
- Roles
    

### InvitationManager

Supports:

- Invite Member
    
- View Invitations
    

### OwnershipAssignmentsTable

Displays:

- Responsibility Areas
    
- Current Owner
    

### ProfileSettingsForm

Supports:

- User Profile Updates
    

## Data Dependencies

```text
GET /api/households/current

PUT /api/households/current

GET /api/members

POST /api/invitations

GET /api/invitations

GET /api/ownership

PATCH /api/ownership/:id
```

## Permissions

OWNER

- Full Access
    

MEMBER

- View Household Settings
    
- Edit Own Profile
    

MEMBER cannot:

- Invite Users
    
- Modify Ownership Assignments
    
- Manage Household
    

---

# Permission Matrix

|Page|Owner|Member|
|---|---|---|
|Dashboard|View|View|
|Planning|View/Edit|View/Edit|
|Meals|Full|Full|
|Groceries|Full|Full|
|Chores|Full|Full|
|Budget|Full|Limited|
|Settings|Full|Profile Only|

---

# State Management Strategy

## Server State

TanStack Query

Used For:

- API Requests
    
- Caching
    
- Refetching
    
- Optimistic Updates
    

## Client State

React State

Used For:

- Forms
    
- Dialogs
    
- Filters
    
- Temporary UI State
    

## Global Context

HouseholdContext

Stores:

- Active Household
    
- Membership Role
    
- Permission Set
    

---

# Mobile Navigation

Bottom Navigation Tabs

```text
Dashboard
Planning
Meals
Groceries
More
```

More Menu:

```text
Chores
Budget
Settings
```
