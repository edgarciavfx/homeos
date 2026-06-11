# HOS - Application Services Specification

Version: 1.0  
Status: Approved for MVP Implementation  
Phase: Application Design

---

# Purpose

This document defines the Application Service Layer for HomeOS MVP.

Application Services orchestrate:

- Validation
    
- Authorization
    
- Domain rules
    
- Repository interactions
    
- Transaction boundaries
    
- Cross-domain workflows
    

Application Services do not contain persistence logic.

Persistence is delegated to repositories.

Application Services serve as the primary implementation contract for:

- API Controllers
    
- Route Handlers
    
- AI Coding Agents
    
- Integration Tests
    

---

# Application Layer Architecture

```text
API Route
    │
    ▼
Application Service
    │
    ├── Validation
    ├── Authorization
    ├── Business Rules
    ├── Transaction Management
    │
    ▼
Repositories
    │
    ▼
PostgreSQL
```

---

# Household Domain Services

---

## CreateHouseholdService

### Purpose

Creates a new household and assigns the creator as Owner.

### Related Requirements

- FR-001
    
- US-001
    

---

### Input DTO

```typescript
interface CreateHouseholdInput {
  userId: string;
  name: string;
}
```

---

### Output DTO

```typescript
interface CreateHouseholdOutput {
  householdId: string;
  name: string;
  ownerId: string;
  createdAt: Date;
}
```

---

### Business Rules

#### BR-001

Household name is required.

#### BR-002

Household name must be between 3 and 100 characters.

#### BR-003

Creator must be authenticated.

#### BR-004

Creator automatically becomes Household Owner.

---

### Transaction

Single transaction.

```text
1. Create Household
2. Create HouseholdMember(OWNER)
3. Commit
```

Rollback if any step fails.

---

### Dependencies

Repositories:

```text
HouseholdRepository
HouseholdMemberRepository
```

Infrastructure:

```text
TransactionManager
Clock
```

---

### Pseudocode

```text
validate(input)

begin transaction

household = create household

create owner membership

commit

return result
```

---

# InviteMemberService

### Purpose

Invites a new member into an existing household.

### Related Requirements

- FR-002
    
- US-002
    

---

### Input DTO

```typescript
interface InviteMemberInput {
  householdId: string;
  invitedByUserId: string;
  email: string;
}
```

---

### Output DTO

```typescript
interface InviteMemberOutput {
  invitationId: string;
  email: string;
  expiresAt: Date;
}
```

---

### Business Rules

#### BR-005

Only Owners may invite members.

#### BR-006

Email must be valid.

#### BR-007

Email cannot already belong to a household member.

#### BR-008

Duplicate active invitations are not allowed.

#### BR-009

Invitation expires after 7 days.

---

### Transaction

Single transaction.

```text
1. Validate ownership
2. Create invitation
3. Commit
```

Email dispatch occurs after commit.

---

### Dependencies

Repositories:

```text
HouseholdMemberRepository
InvitationRepository
```

Infrastructure:

```text
EmailProvider
TokenGenerator
TransactionManager
Clock
```

---

### Pseudocode

```text
assert owner

assert email not already member

assert no active invitation

create token

create invitation

commit

send email

return result
```

---

# Planning Domain Services

---

## GenerateWeeklyPlanService

### Purpose

Generates planning recommendations for a household week.

### Related Requirements

- FR-004
    
- FR-005
    
- FR-006
    
- FR-007
    
- FR-008
    

---

### Input DTO

```typescript
interface GenerateWeeklyPlanInput {
  householdId: string;
  userId: string;
  weekStartDate: Date;
}
```

---

### Output DTO

```typescript
interface GenerateWeeklyPlanOutput {
  weeklyPlanId: string;

  priorities: WeeklyPriorityRecommendation[];

  generatedAt: Date;
}
```

```typescript
interface WeeklyPriorityRecommendation {
  title: string;
  description?: string;
  suggestedOwnerId?: string;
  suggestedDate?: Date;
  priorityScore: number;
}
```

---

### Business Rules

#### BR-010

User must belong to household.

#### BR-011

One active plan per household/week.

#### BR-012

Recommendations are generated using deterministic rules.

#### BR-013

Recommendations include overdue chores.

#### BR-014

Recommendations include unassigned responsibilities.

#### BR-015

Recommendations include upcoming deadlines.

#### BR-016

Recommendations must be generated in less than 3 seconds.

---

### Recommendation Inputs

Collected from:

```text
Overdue Chores
Upcoming Chore Occurrences
Ownership Assignments
Previous Weekly Plan
Current Meal Schedule
Budget Status
```

---

### Transaction

Single transaction.

```text
1. Load planning inputs
2. Generate recommendations
3. Create WeeklyPlan(DRAFT)
4. Create WeeklyPriorities
5. Commit
```

---

### Dependencies

Repositories:

```text
WeeklyPlanRepository
WeeklyPriorityRepository
ChoreRepository
ChoreOccurrenceRepository
OwnershipAssignmentRepository
BudgetRepository
ScheduledMealRepository
```

Infrastructure:

```text
RecommendationEngine
TransactionManager
Clock
```

---

### Recommendation Algorithm (MVP)

```text
score = 0

if overdue chore
  +100

if due within 3 days
  +50

if unassigned
  +25

if budget exceeded
  +40

sort descending
return top recommendations
```

---

# Meal Domain Services

---

## GenerateMealRecommendationsService

### Purpose

Suggests meals for the weekly planning cycle.

### Related Requirements

- FR-013
    
- US-013
    

---

### Input DTO

```typescript
interface GenerateMealRecommendationsInput {
  householdId: string;
  weeklyPlanId: string;
}
```

---

### Output DTO

```typescript
interface GenerateMealRecommendationsOutput {
  recommendations: MealRecommendation[];
}
```

```typescript
interface MealRecommendation {
  mealId: string;
  mealName: string;
  preparationMinutes: number;
  recommendationScore: number;
}
```

---

### Business Rules

#### BR-017

At least 3 recommendations must be returned.

#### BR-018

Archived meals are excluded.

#### BR-019

Recommendations favor frequently used meals.

#### BR-020

Recommendations favor lower preparation times.

#### BR-021

Recommendations should avoid excessive repetition.

#### BR-022

Response time must remain under 3 seconds.

---

### Recommendation Factors

```text
Preparation Time
Historical Usage
Recent Usage Frequency
Meal Availability
```

---

### Scoring Example

```text
score =
usage_frequency * 5
+
recently_used_penalty
+
quick_meal_bonus
```

---

### Transaction

Read-only.

No transaction required.

---

### Dependencies

Repositories:

```text
MealRepository
ScheduledMealRepository
WeeklyPlanRepository
```

Infrastructure:

```text
MealRecommendationEngine
```

---

### Pseudocode

```text
load meals

remove archived meals

calculate score

sort descending

return top meals
```

---

# Grocery Domain Services

---

## GenerateGroceryListService

### Purpose

Creates a grocery list from approved meals.

### Related Requirements

- FR-014
    
- FR-015
    
- FR-016
    
- FR-017
    

---

### Input DTO

```typescript
interface GenerateGroceryListInput {
  householdId: string;
  weeklyPlanId: string;
}
```

---

### Output DTO

```typescript
interface GenerateGroceryListOutput {
  groceryListId: string;
  itemCount: number;
}
```

---

### Business Rules

#### BR-023

Weekly plan must exist.

#### BR-024

Only scheduled meals are considered.

#### BR-025

Duplicate ingredients are merged.

#### BR-026

Quantities are aggregated.

#### BR-027

Units must match before aggregation.

#### BR-028

Generated items use source GENERATED.

#### BR-029

Manual items are preserved during regeneration.

---

### Aggregation Example

```text
Chicken Breast
1 kg

Chicken Breast
0.5 kg

Result:

Chicken Breast
1.5 kg
```

---

### Transaction

Single transaction.

```text
1. Load scheduled meals
2. Aggregate ingredients
3. Create grocery list
4. Create grocery items
5. Commit
```

---

### Dependencies

Repositories:

```text
WeeklyPlanRepository
ScheduledMealRepository
MealIngredientRepository
GroceryListRepository
GroceryItemRepository
```

Infrastructure:

```text
IngredientAggregator
TransactionManager
Clock
```

---

### Pseudocode

```text
load meals

extract ingredients

group by
  name + unit

sum quantities

persist list

persist items

commit
```

---

# Budget Domain Services

---

## CalculateBudgetRemainingService

### Purpose

Calculates available food budget for a given month.

### Related Requirements

- FR-024
    
- FR-025
    

---

### Input DTO

```typescript
interface CalculateBudgetRemainingInput {
  householdId: string;
  month: number;
  year: number;
}
```

---

### Output DTO

```typescript
interface CalculateBudgetRemainingOutput {
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  isOverBudget: boolean;
}
```

---

### Business Rules

#### BR-030

Budget must exist.

#### BR-031

All purchases within the budget period are included.

#### BR-032

Remaining amount may be negative.

#### BR-033

Calculations must reflect latest purchases.

#### BR-034

Calculation must be deterministic.

---

### Formula

```text
remaining =
budget.amount
-
SUM(purchases.amount)
```

---

### Transaction

Read-only.

No transaction required.

---

### Dependencies

Repositories:

```text
BudgetRepository
PurchaseRepository
```

Infrastructure:

```text
BudgetCalculator
```

---

### Pseudocode

```text
load budget

load purchases

spent = sum(purchases)

remaining = budget - spent

return result
```

---

# Cross-Cutting Concerns

---

## Authorization Rules

Every service must verify:

```text
Authenticated User

AND

User belongs to household
```

Owner-only services:

```text
InviteMemberService
```

---

## Transaction Policy

Use transaction boundaries only for:

```text
Create
Update
Delete
```

Read-only services should avoid transactions.

---

## Validation Strategy

Validation order:

```text
1. DTO Validation
2. Authorization
3. Business Rules
4. Persistence
```

---

## Error Standards

### Validation Error

```typescript
VALIDATION_ERROR
```

HTTP:

```text
400
```

---

### Authorization Error

```typescript
FORBIDDEN
```

HTTP:

```text
403
```

---

### Resource Not Found

```typescript
NOT_FOUND
```

HTTP:

```text
404
```

---

### Business Rule Violation

```typescript
BUSINESS_RULE_VIOLATION
```

HTTP:

```text
409
```

---

### Unexpected Error

```typescript
INTERNAL_SERVER_ERROR
```

HTTP:

```text
500
```

---

# Implementation Readiness Statement

This specification defines the canonical Application Service Layer for HomeOS MVP.

It provides sufficient detail for:

1. Repository Implementation
    
2. API Route Development
    
3. Integration Test Creation
    
4. AI-Assisted Coding
    
5. Service Layer Construction
    

This document should be treated as the primary implementation contract between API endpoints and domain persistence.