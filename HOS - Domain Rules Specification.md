# HOS - Domain Rules Specification

Version: 1.0
Status: Approved for MVP Implementation
Phase: Domain Design

---

# Purpose

This document defines the core domain model and business invariants for HomeOS MVP.

It serves as the canonical source for:

- Aggregate boundaries
- Domain rules
- Entity lifecycle rules
- State transitions
- Domain services
- Business invariants

Application Services must enforce these rules.

Repositories must never enforce business rules.

---

# Aggregate Roots

## Household

Root Entity:

Household

Children:

- HouseholdMember
- Invitation
- OwnershipAssignment

### Invariants

DR-001

Household name must be unique per owner.

DR-002

Household must always have at least one Owner.

DR-003

A user may only have one membership per household.

DR-004

Deleted households cannot be modified.

---

## Meal

Root Entity:

Meal

Children:

- MealIngredient

### Invariants

DR-005

Meal name must be unique within household.

DR-006

Archived meals cannot be scheduled.

DR-007

Archived meals cannot be edited.

DR-008

Meal must contain at least one ingredient.

DR-009

Ingredient quantity must be greater than zero.

DR-010

Ingredient unit is required.

---

## WeeklyPlan

Root Entity:

WeeklyPlan

Children:

- WeeklyPriority
- ScheduledMeal

### Invariants

DR-011

One WeeklyPlan per household per week.

DR-012

WeekStartDate is immutable after creation.

DR-013

Approved plans cannot be deleted.

DR-014

Scheduled meals must occur inside plan week.

DR-015

Priority title is required.

### Status Lifecycle

DRAFT

↓

APPROVED

Approved plans may still allow priority completion updates.

---

## GroceryList

Root Entity:

GroceryList

Children:

- GroceryItem

### Invariants

DR-016

One GroceryList per WeeklyPlan.

DR-017

Generated items may be regenerated.

DR-018

Manual items must survive regeneration.

DR-019

Completed items remain completed after refresh.

---

## Chore

Root Entity:

Chore

Children:

- ChoreOccurrence

### Invariants

DR-020

Chore name required.

DR-021

Frequency required.

DR-022

Only active chores generate occurrences.

DR-023

Occurrence completion timestamp is immutable.

### Frequency Values

DAILY
WEEKLY
BIWEEKLY
MONTHLY

---

## Budget

Root Entity:

Budget

Children:

- Purchase

### Invariants

DR-024

One budget per household/month.

DR-025

Budget amount must be positive.

DR-026

Purchases cannot be negative.

DR-027

Budget may become negative.

DR-028

Purchases cannot exist without budget.

---

# Domain Services

## RecommendationEngine

Responsibilities:

- Score priorities
- Rank recommendations
- Sort recommendations

Must remain deterministic.

No AI dependency in MVP.

---

## MealRecommendationEngine

Responsibilities:

- Favor frequent meals
- Penalize recent repetition
- Favor low preparation time

Must remain deterministic.

---

## IngredientAggregator

Responsibilities:

- Group ingredients
- Aggregate quantities
- Preserve units

Aggregation key:

name + unit

---

## BudgetCalculator

Responsibilities:

- Calculate spent amount
- Calculate remaining amount
- Determine over-budget status

Formula:

remaining = budget - purchases

---

# Domain Events

MVP supports internal events only.

Events:

HouseholdCreated
MemberInvited
WeeklyPlanGenerated
MealScheduled
GroceryListGenerated
PurchaseRecorded
ChoreCompleted

No event bus required in MVP.

---

# Soft Delete Policy

Aggregate Roots:

Household
Meal
WeeklyPlan
Chore
Budget

Use:

deletedAt

Children should generally be hard deleted with aggregate updates.

---

# Implementation Readiness Statement

This document defines the authoritative business invariants of HomeOS MVP and must be enforced by Application Services.