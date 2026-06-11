# HOS - AI Implementation Guide

Version: 1.0  
Status: Approved for Development  
Phase: AI-Assisted Implementation

---

# Purpose

This document provides implementation standards for HomeOS MVP.

It serves as the primary guide for:

- Human developers
    
- AI coding agents
    
- Code reviews
    
- Test creation
    
- Feature implementation
    
- Refactoring efforts
    

This document should be supplied alongside:

- Database Design Specification
    
- Prisma Schema Design
    
- API Specification
    
- Application Services Specification
    
- Frontend Architecture Specification
    

---

# Technology Stack

## Frontend

```text
Next.js 16+
TypeScript
Tailwind CSS
Shadcn/UI
TanStack Query
React Hook Form
Zod
Auth.js
```

## Backend

```text
Next.js Route Handlers
TypeScript
Prisma ORM
PostgreSQL
Auth.js
```

## Testing

```text
Vitest
Testing Library
Supertest
Playwright
```

---

# Repository Structure

```text
homeos/

├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── src/
│
│   ├── app/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── dashboard/
│   │   ├── planning/
│   │   ├── meals/
│   │   ├── groceries/
│   │   ├── chores/
│   │   ├── budget/
│   │   └── settings/
│   │
│   ├── features/
│   │   ├── households/
│   │   ├── planning/
│   │   ├── meals/
│   │   ├── groceries/
│   │   ├── chores/
│   │   └── budgets/
│   │
│   ├── domain/
│   │   ├── household/
│   │   ├── planning/
│   │   ├── meals/
│   │   ├── groceries/
│   │   ├── chores/
│   │   └── budgets/
│   │
│   ├── application/
│   │   ├── households/
│   │   ├── planning/
│   │   ├── meals/
│   │   ├── groceries/
│   │   ├── chores/
│   │   └── budgets/
│   │
│   ├── infrastructure/
│   │   ├── prisma/
│   │   ├── repositories/
│   │   ├── auth/
│   │   ├── email/
│   │   └── recommendations/
│   │
│   ├── lib/
│   │   ├── auth/
│   │   ├── validation/
│   │   ├── permissions/
│   │   ├── api/
│   │   ├── dates/
│   │   └── constants/
│   │
│   ├── hooks/
│   │
│   ├── types/
│   │
│   └── test/
│       ├── factories/
│       ├── fixtures/
│       ├── integration/
│       ├── e2e/
│       └── utils/
│
└── package.json
```

---

# Architectural Layers

```text
Route Handler
        ↓
Application Service
        ↓
Repository
        ↓
Prisma
        ↓
PostgreSQL
```

Rules:

- Route handlers contain no business logic.
    
- Repositories contain no business rules.
    
- Domain logic belongs in services/domain modules.
    
- Prisma is isolated behind repositories.
    
- UI never accesses Prisma directly.
    

---

# Naming Conventions

## Files

```text
kebab-case.ts

create-household.service.ts
meal.repository.ts
budget-calculator.ts
```

## Components

```text
PascalCase.tsx

MealForm.tsx
WeeklyPlanSummaryCard.tsx
```

## Types

```typescript
CreateMealInput
CreateMealOutput

BudgetSummaryDto
MealRecommendationDto
```

## Constants

```typescript
MAX_HOUSEHOLD_NAME_LENGTH
INVITATION_EXPIRATION_DAYS
```

---

# TypeScript Standards

## Strict Mode

Must remain enabled.

```json
{
  "strict": true
}
```

## Avoid

```typescript
any
```

Use:

```typescript
unknown
```

or strongly typed interfaces.

## Return Types

Required for:

```typescript
Application Services
Repositories
Utilities
Public Functions
```

Example:

```typescript
async function createHousehold(
  input: CreateHouseholdInput
): Promise<CreateHouseholdOutput>
```

---

# Prisma Conventions

## Access

Only repositories may access PrismaClient.

Forbidden:

```typescript
route.ts
component.tsx
service.ts
```

Allowed:

```typescript
household.repository.ts
meal.repository.ts
```

## Transactions

Use:

```typescript
prisma.$transaction()
```

For:

```text
Create
Update
Delete
```

Avoid transactions for read-only operations.

## Soft Deletes

Aggregate roots use:

```typescript
deletedAt: Date | null
```

Never hard-delete:

```text
Household
Meal
WeeklyPlan
Chore
Budget
```

Query pattern:

```typescript
where: {
  deletedAt: null
}
```

## Repository Example

```typescript
export class MealRepository {
  async findById(id: string): Promise<Meal | null> {
    return prisma.meal.findFirst({
      where: {
        id,
        deletedAt: null
      }
    });
  }
}
```

---

# Validation Standards

All external input must use Zod.

Example:

```typescript
export const CreateMealSchema = z.object({
  name: z.string().min(1).max(150),
  preparationMinutes: z.number().int().positive()
});
```

Validation order:

```text
1. Request Validation
2. Authentication
3. Authorization
4. Business Rules
5. Persistence
```

---

# API Conventions

## Route Structure

```text
/api/v1
```

Examples:

```text
POST /api/v1/households

POST /api/v1/weekly-plans/{id}/recommendations

POST /api/v1/grocery-lists/{id}/items
```

## Response Envelope

Success:

```typescript
{
  success: true,
  data
}
```

Failure:

```typescript
{
  success: false,
  error: {
    code,
    message
  }
}
```

## Error Codes

```text
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
CONFLICT
INTERNAL_ERROR
```

## Pagination

```typescript
{
  data: [],
  meta: {
    page,
    pageSize,
    totalItems,
    totalPages
  }
}
```

---

# Authentication Standards

## Auth.js

Session-based authentication.

Protected route template:

```typescript
const session = await auth();

if (!session?.user) {
  throw new UnauthorizedError();
}
```

## Household Authorization

Always verify:

```text
User exists

AND

User belongs to household
```

Owner-only actions:

```text
Invite Member
Manage Ownership Assignments
Edit Household
```

---

# Frontend Standards

## Data Fetching

Use TanStack Query.

Never:

```typescript
fetch(...)
```

directly inside UI components.

Use:

```typescript
useQuery()
useMutation()
```

## Forms

Use:

```text
React Hook Form
Zod Resolver
```

## Page Structure

```text
page.tsx

→ container

→ feature components

→ ui components
```

Keep pages thin.

---

# Service Implementation Pattern

Example:

```typescript
export class CreateHouseholdService {
  constructor(
    private householdRepository: HouseholdRepository,
    private memberRepository: HouseholdMemberRepository
  ) {}

  async execute(
    input: CreateHouseholdInput
  ): Promise<CreateHouseholdOutput> {

    validate(input);

    return transaction(async () => {
      // implementation
    });
  }
}
```

Rules:

```text
Single responsibility
Dependency injection
No static state
No Prisma access
```

---

# Repository Pattern

Example:

```typescript
export interface MealRepository {
  findById(id: string): Promise<Meal | null>;

  create(data: CreateMealData): Promise<Meal>;

  update(id: string, data: UpdateMealData): Promise<Meal>;
}
```

Infrastructure layer:

```typescript
PrismaMealRepository
```

implements interface.

---

# Testing Strategy

## Coverage Targets

```text
Domain Services       90%
Application Services  80%
API Routes            80%
Critical Workflows   100%
```

---

## Unit Tests

Test:

```text
Domain logic
Calculators
Aggregators
Recommendation engines
Validators
```

Do not test:

```text
Database
HTTP
Prisma
```

Example:

```typescript
describe("BudgetCalculator", () => {
  it("calculates remaining budget");
});
```

---

## Integration Tests

Test:

```text
Application Services
Repositories
Database interactions
Authorization
```

Use:

```text
Test PostgreSQL Database
Seed Data
Factories
```

---

## End-to-End Tests

Use:

```text
Playwright
```

Cover:

```text
Create Household

Invite Member

Generate Weekly Plan

Schedule Meals

Generate Grocery List

Record Purchase

Complete Chore
```

These workflows are mandatory.

---

# AI Coding Agent Rules

## Always

```text
Follow existing folder structure

Use strict typing

Use Zod validation

Use dependency injection

Write tests

Return DTOs

Use repositories

Use transactions when required
```

## Never

```text
Use any

Access Prisma from UI

Access Prisma from Route Handlers

Duplicate business logic

Mix validation and persistence

Hardcode IDs

Hardcode dates
```

---

# AI Prompt Templates

## Generate Repository

```text
Act as a senior TypeScript backend engineer.

Implement the Prisma repository below.

Requirements:

- Follow HomeOS repository conventions
- Use strict typing
- Support soft deletion
- Include Vitest tests
- No business logic

Repository:
<repository interface>
```

---

## Generate Application Service

```text
Act as a senior domain-driven design engineer.

Implement the following application service.

Requirements:

- Follow HomeOS Application Service Specification
- Validate inputs
- Enforce authorization
- Use repository interfaces
- Include Vitest tests
- Include error handling

Service:
<service name>
```

---

## Generate Route Handler

```text
Act as a senior Next.js engineer.

Implement a Route Handler.

Requirements:

- Auth.js authentication
- Zod validation
- Application Service invocation
- Standard API envelope
- Proper HTTP status codes
- Integration tests

Endpoint:
<endpoint>
```

---

## Generate React Feature

```text
Act as a senior frontend engineer.

Implement a HomeOS feature.

Requirements:

- Next.js App Router
- TypeScript
- Shadcn UI
- React Hook Form
- TanStack Query
- Zod validation
- Component tests

Feature:
<feature name>
```

---

# Recommended Implementation Order

Sprint 1

```text
Authentication
Households
Memberships
Ownership Assignments
```

Sprint 2

```text
Meals
Ingredients
Meal Library
```

Sprint 3

```text
Weekly Planning
Priorities
Meal Scheduling
Recommendations
```

Sprint 4

```text
Grocery Lists
Aggregation Engine
Shopping Workflow
```

Sprint 5

```text
Chores
Chore Occurrences
Ownership Workflows
```

Sprint 6

```text
Budgets
Purchases
Dashboard
Reporting
```

---

# Implementation Readiness Statement

This guide defines the canonical implementation standards for HomeOS MVP.

When combined with the approved architecture, database, API, frontend, and application service specifications, it provides sufficient detail for:

- AI-assisted coding
    
- Repository implementation
    
- Route development
    
- Frontend construction
    
- Test creation
    
- MVP delivery
    

HomeOS is now implementation-ready.