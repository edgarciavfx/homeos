# HOS - Test Strategy

Version: 1.0  
Status: Approved for MVP Implementation  
Phase: Quality Assurance & Verification

---

# Purpose

This document defines the testing strategy for HomeOS MVP.

The strategy ensures:

- Business rules are validated
    
- Application services behave correctly
    
- API contracts remain stable
    
- Critical user workflows function end-to-end
    
- Future refactoring can occur safely
    

The testing pyramid for HomeOS is:

```text
                E2E Tests
                   ▲
             Integration Tests
                   ▲
               Unit Tests
```

Priority is placed on:

1. Domain correctness
    
2. Application service orchestration
    
3. API contract stability
    
4. User workflow reliability
    

---

# Testing Stack

## Unit Testing

```text
Vitest
```

Purpose:

```text
Fast feedback
Business logic verification
Service rule validation
```

---

## Integration Testing

```text
Vitest
Test PostgreSQL Database
Prisma
```

Purpose:

```text
Repository testing
Transaction validation
Application service testing
```

---

## End-to-End Testing

```text
Playwright
```

Purpose:

```text
Validate complete user workflows
Validate frontend/backend integration
Detect regressions
```

---

# Test Environment Strategy

## Local Development

```text
Unit Tests

Mocked Dependencies
```

---

## Integration Environment

```text
Docker PostgreSQL

Prisma Migrations

Seed Data
```

---

## CI Pipeline

```text
Install Dependencies

Run Lint

Run Type Check

Run Unit Tests

Run Integration Tests

Run E2E Tests

Build Application
```

Failure in any stage blocks deployment.

---

# Coverage Targets

|Area|Target|
|---|---|
|Domain Services|90%|
|Application Services|80%|
|API Routes|80%|
|Critical Workflows|100%|

---

# Unit Testing Strategy

---

## Scope

Unit tests verify:

```text
Business Rules

Validation Logic

Recommendation Algorithms

Calculations

Utility Functions
```

External dependencies must be mocked.

```text
Repositories
Email Providers
Transaction Managers
Clock
Recommendation Engines
```

---

# Domain Service Tests

## RecommendationEngine

Test Cases:

```text
Overdue chore increases score

Upcoming chore increases score

Budget exceeded increases score

Unassigned responsibility increases score

Recommendations sorted descending

Only top recommendations returned
```

---

## MealRecommendationEngine

Test Cases:

```text
Archived meals excluded

Frequently used meals prioritized

Quick meals prioritized

Recently repeated meals penalized

Minimum recommendation count returned
```

---

## IngredientAggregator

Test Cases:

```text
Duplicate ingredients merged

Quantities aggregated

Different units not aggregated

Empty ingredient list handled

Large ingredient sets supported
```

---

## BudgetCalculator

Test Cases:

```text
Budget with no purchases

Budget with purchases

Exact budget usage

Over-budget scenario

Negative remaining balance
```

---

# Validation Tests

Validate DTO constraints:

```text
Required fields

String lengths

Email formats

UUID formats

Date formats

Money values

Enum values
```

Examples:

```text
CreateHouseholdInput

InviteMemberInput

CreateMealInput

CreateBudgetInput

ScheduleMealInput
```

---

# Application Service Testing

Application Services are tested with mocked repositories.

Goal:

```text
Verify orchestration

Verify transactions

Verify business rules

Verify authorization
```

---

## CreateHouseholdService

Test Cases

```text
Creates household successfully

Creates owner membership

Rejects unauthenticated user

Rejects invalid household name

Rolls back on membership failure
```

Related Rules:

```text
BR-001
BR-002
BR-003
BR-004
```

---

## InviteMemberService

Test Cases

```text
Owner can invite

Member cannot invite

Duplicate invitation rejected

Existing member rejected

Expiration date assigned

Email sent after commit
```

Related Rules:

```text
BR-005
BR-006
BR-007
BR-008
BR-009
```

---

## GenerateWeeklyPlanService

Test Cases

```text
Generates recommendations

Creates draft plan

Includes overdue chores

Includes upcoming deadlines

Rejects duplicate weekly plans

Completes within performance target
```

Related Rules:

```text
BR-010
BR-011
BR-012
BR-013
BR-014
BR-015
BR-016
```

---

## GenerateMealRecommendationsService

Test Cases

```text
Returns recommendations

Filters archived meals

Applies scoring rules

Returns minimum count

Meets performance target
```

---

## GenerateGroceryListService

Test Cases

```text
Creates grocery list

Aggregates ingredients

Preserves manual items

Generates source=GENERATED items

Handles empty schedules
```

---

## CalculateBudgetRemainingService

Test Cases

```text
Calculates remaining budget

Calculates spent amount

Handles over-budget state

Uses latest purchases
```

---

# Repository Integration Tests

Repositories are tested against a real PostgreSQL database.

No mocks allowed.

---

## HouseholdRepository

Verify:

```text
Create household

Find by id

List households

Soft delete behavior
```

---

## MealRepository

Verify:

```text
Create meal

Update meal

Archive meal

Query active meals

Unique meal names per household
```

---

## GroceryRepository

Verify:

```text
Create grocery list

Create grocery items

Query active list

Completion updates
```

---

## ChoreRepository

Verify:

```text
Create chore

Create occurrences

Overdue queries

Ownership assignment
```

---

## BudgetRepository

Verify:

```text
Create budget

Unique household/month constraint

Create purchase

Budget summary queries
```

---

# Database Constraint Tests

Verify database-level enforcement.

---

## Constraints

```text
Unique household/month/year budget

Unique meal name per household

Foreign key integrity

Required relationships

Soft delete filtering

Check constraints
```

Examples:

```text
amount >= 0

purchase amount > 0

ingredient quantity > 0

preparation minutes >= 0
```

---

# API Testing Strategy

API tests execute against running route handlers.

Authentication is included.

Database uses isolated test data.

---

# Authentication Tests

Verify:

```text
Unauthenticated requests rejected

Authenticated requests accepted

Household membership enforced

Owner permissions enforced
```

---

# Endpoint Coverage

Minimum coverage target:

```text
80%
```

All routes defined in API Specification must have:

```text
Success path

Validation failure

Authorization failure

Resource not found

Business rule conflict
```

---

## Example

POST /households

Tests:

```text
201 Created

400 Invalid Name

401 Unauthenticated

500 Unexpected Failure
```

---

# Contract Testing

Validate response DTOs.

Examples:

```text
Create Household

Create Meal

Generate Grocery List

Budget Summary
```

Assertions:

```text
Field names

Data types

Nullable fields

Response envelope format
```

---

# End-to-End Testing Strategy

Playwright validates real user workflows.

Environment:

```text
Frontend
API
Database
Authentication
```

All running together.

---

# Critical Workflow Coverage

Critical workflows require:

```text
100% coverage
```

---

## Workflow 1

Household Creation

```text
Register User

Create Household

Verify Owner Role

Navigate Dashboard
```

---

## Workflow 2

Invite Member

```text
Owner Invites User

Invitation Created

User Accepts Invitation

Membership Created
```

---

## Workflow 3

Weekly Planning Session

```text
Open Planning

Generate Recommendations

Edit Priorities

Save Weekly Plan
```

---

## Workflow 4

Meal Planning

```text
Create Meal

Add Ingredients

Schedule Meal

Generate Recommendations
```

---

## Workflow 5

Grocery Generation

```text
Create Weekly Plan

Schedule Meals

Generate Grocery List

Verify Aggregated Items
```

---

## Workflow 6

Shopping Progress

```text
Open Grocery List

Complete Items

Verify Progress Updates
```

---

## Workflow 7

Chore Management

```text
Create Chore

Assign Owner

Generate Occurrence

Complete Occurrence
```

---

## Workflow 8

Budget Tracking

```text
Create Budget

Record Purchases

View Budget Summary

Verify Remaining Amount
```

---

# Performance Testing

MVP performance requirements.

---

## GenerateWeeklyPlanService

Target:

```text
< 3 seconds
```

Dataset:

```text
100 chores
50 occurrences
50 scheduled meals
12 months purchase history
```

---

## GenerateMealRecommendationsService

Target:

```text
< 3 seconds
```

Dataset:

```text
500 meals
5000 meal schedules
```

---

## Dashboard Load

Target:

```text
< 2 seconds
```

Queries:

```text
Current Plan

Upcoming Meals

Overdue Chores

Budget Summary

Grocery Progress
```

---

# Test Data Strategy

Factories should generate:

```text
Users

Households

Members

Meals

Ingredients

Weekly Plans

Priorities

Grocery Lists

Chores

Budgets

Purchases
```

Guidelines:

```text
Deterministic

Reusable

Independent

Easy to compose
```

---

# CI Quality Gates

Pull Request Requirements

```text
All Tests Pass

Coverage Thresholds Met

No TypeScript Errors

No ESLint Errors
```

---

# Release Criteria

A release is approved only if:

```text
Domain Services >= 90%

Application Services >= 80%

API Routes >= 80%

Critical Workflow Coverage = 100%

No Failing E2E Tests

No High Severity Defects
```

---

# Approval Statement

This test strategy establishes the quality baseline for HomeOS MVP.

It is the authoritative testing guide for:

1. Backend Development
    
2. Frontend Development
    
3. API Development
    
4. CI/CD Pipelines
    
5. AI-Assisted Implementation
    
6. Release Validation
    

Approved for MVP implementation.