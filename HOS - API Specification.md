# HOS - API Specification

Version: 1.0  
Status: Approved for MVP Implementation  
Phase: API Design

---

# Purpose

This document defines the HomeOS MVP REST API.

It serves as the implementation contract for:

- Frontend Development
- Backend Development
- API Testing
- DTO Definitions
- Validation Rules
- AI-Assisted Implementation

---

# API Standards

## Base URL

```
/api/v1
```

## Content Type

Request

```
Content-Type: application/json
```

Response

```
Content-Type: application/json
```

---

# Authentication

Provider:

```
Auth.js
```

All endpoints except authentication endpoints require:

```
Authorization: Session Cookie
```

Authenticated user must belong to the household being accessed.

---

# Standard Response Envelope

Success

```
{  "success": true,  "data": {}}
```

Failure

```
{  "success": false,  "error": {    "code": "VALIDATION_ERROR",    "message": "Household name is required"  }}
```

---

# Household Module

---

## Create Household

### Endpoint

```
POST /households
```

### Request DTO

```
{  "name": "Edgar & Marifer"}
```

### Validation

|Field|Rules|
|---|---|
|name|Required|
|name|2-100 chars|

### Response DTO

```
{  "id": "uuid",  "name": "Edgar & Marifer",  "createdAt": "2026-06-10T12:00:00Z"}
```

---

## List User Households

### Endpoint

```
GET /households
```

### Response DTO

```
[  {    "id": "uuid",    "name": "Home",    "role": "OWNER"  }]
```

---

## Invite Member

### Endpoint

```
POST /households/{householdId}/invitations
```

### Request DTO

```
{  "email": "user@example.com"}
```

### Validation

|Field|Rules|
|---|---|
|email|Required|
|email|Valid email|

### Response DTO

```
{  "id": "uuid",  "email": "user@example.com",  "expiresAt": "2026-06-17T00:00:00Z"}
```

---

## Accept Invitation

### Endpoint

```
POST /invitations/{token}/accept
```

### Response DTO

```
{  "householdId": "uuid",  "role": "MEMBER"}
```

---

# Ownership Assignments

---

## List Ownership Areas

```
GET /households/{householdId}/ownerships
```

---

## Assign Ownership

```
POST /households/{householdId}/ownerships
```

### Request DTO

```
{  "areaName": "Bathroom",  "ownerId": "uuid"}
```

### Validation

```
areaName requiredownerId requiredowner must belong to household
```

---

# Weekly Planning Module

---

## Create Weekly Plan

```
POST /households/{householdId}/weekly-plans
```

### Request DTO

```
{  "weekStartDate": "2026-06-15"}
```

### Validation

```
weekStartDate requiredone plan per household per week
```

### Response DTO

```
{  "id": "uuid",  "status": "DRAFT",  "weekStartDate": "2026-06-15"}
```

---

## Get Weekly Plan

```
GET /weekly-plans/{planId}
```

---

## Save Weekly Plan

```
PATCH /weekly-plans/{planId}
```

### Request DTO

```
{  "status": "APPROVED"}
```

---

## Generate Weekly Recommendations

```
POST /weekly-plans/{planId}/recommendations
```

### Response DTO

```
{  "priorities": [    {      "title": "Clean Bathroom",      "suggestedOwnerId": "uuid",      "targetDate": "2026-06-18"    }  ]}
```

---

# Weekly Priorities

---

## Create Priority

```
POST /weekly-plans/{planId}/priorities
```

### Request DTO

```
{  "title": "Laundry",  "description": "Wash and fold clothes",  "ownerId": "uuid",  "targetDate": "2026-06-18"}
```

### Validation

```
title requiredtitle max 200 chars
```

---

## Update Priority

```
PATCH /priorities/{priorityId}
```

---

## Delete Priority

```
DELETE /priorities/{priorityId}
```

---

# Meal Module

---

## Create Meal

```
POST /households/{householdId}/meals
```

### Request DTO

```
{  "name": "Chicken Tacos",  "preparationMinutes": 30}
```

### Validation

|Field|Rules|
|---|---|
|name|Required|
|name|Max 150|
|preparationMinutes|Positive integer|

### Response DTO

```
{  "id": "uuid",  "name": "Chicken Tacos",  "preparationMinutes": 30,  "archived": false}
```

---

## List Meals

```
GET /households/{householdId}/meals
```

### Query Parameters

```
?archived=false?page=1&pageSize=20
```

---

## Update Meal

```
PATCH /meals/{mealId}
```

---

## Archive Meal

```
DELETE /meals/{mealId}
```

Soft delete:

```
{  "archived": true}
```

---

# Meal Ingredients

---

## Add Ingredient

```
POST /meals/{mealId}/ingredients
```

### Request DTO

```
{  "name": "Chicken Breast",  "quantity": 1.5,  "unit": "kg"}
```

### Validation

```
name requiredquantity > 0unit required
```

---

## Update Ingredient

```
PATCH /ingredients/{ingredientId}
```

---

## Delete Ingredient

```
DELETE /ingredients/{ingredientId}
```

---

# Meal Scheduling

---

## Schedule Meal

```
POST /weekly-plans/{planId}/scheduled-meals
```

### Request DTO

```
{  "mealId": "uuid",  "scheduledDate": "2026-06-16"}
```

### Validation

```
meal must belong to householddate must be inside plan week
```

---

## Move Scheduled Meal

```
PATCH /scheduled-meals/{id}
```

---

## Remove Scheduled Meal

```
DELETE /scheduled-meals/{id}
```

---

## Generate Meal Recommendations

```
POST /weekly-plans/{planId}/meal-recommendations
```

### Response DTO

```
{  "recommendations": [    {      "mealId": "uuid",      "mealName": "Chicken Tacos"    }  ]}
```

---

# Grocery Module

---

## Generate Grocery List

```
POST /weekly-plans/{planId}/grocery-list
```

### Response DTO

```
{  "groceryListId": "uuid"}
```

---

## Get Grocery List

```
GET /grocery-lists/{listId}
```

---

## Add Manual Item

```
POST /grocery-lists/{listId}/items
```

### Request DTO

```
{  "name": "Paper Towels",  "quantity": 1,  "category": "Household"}
```

---

## Update Grocery Item

```
PATCH /grocery-items/{itemId}
```

### Request DTO

```
{  "completed": true}
```

---

## Delete Grocery Item

```
DELETE /grocery-items/{itemId}
```

---

# Chore Module

---

## Create Chore

```
POST /households/{householdId}/chores
```

### Request DTO

```
{  "name": "Bathroom Cleaning",  "frequency": "WEEKLY",  "ownerId": "uuid"}
```

### Validation

```
name requiredfrequency requiredfrequency enum
```

### Frequency Enum

```
DAILYWEEKLYBIWEEKLYMONTHLY
```

---

## List Chores

```
GET /households/{householdId}/chores
```

### Filters

```
?status=OVERDUE
```

---

## Update Chore

```
PATCH /chores/{choreId}
```

---

## Complete Chore Occurrence

```
POST /chore-occurrences/{occurrenceId}/complete
```

---

# Budget Module

---

## Create Monthly Budget

```
POST /households/{householdId}/budgets
```

### Request DTO

```
{  "month": 6,  "year": 2026,  "amount": 12000}
```

### Validation

```
amount > 0month 1-12year >= current year - 1
```

---

## Get Budget Summary

```
GET /budgets/{budgetId}
```

### Response DTO

```
{  "id": "uuid",  "amount": 12000,  "spent": 4500,  "remaining": 7500}
```

---

## Record Purchase

```
POST /budgets/{budgetId}/purchases
```

### Request DTO

```
{  "amount": 750,  "purchaseDate": "2026-06-10",  "notes": "Costco"}
```

### Validation

```
amount > 0purchaseDate required
```

---

## List Purchases

```
GET /budgets/{budgetId}/purchases
```

### Query Parameters

```
?page=1&pageSize=20
```

---

# Validation Rules

## UUID Fields

```
Must be valid UUID v4
```

## Dates

```
ISO-8601YYYY-MM-DD
```

## Money

```
Decimal(12,2)Must be >= 0
```

## Strings

```
Trim whitespaceReject empty strings
```

---

# Error Responses

## 400 Bad Request

```
{  "success": false,  "error": {    "code": "VALIDATION_ERROR",    "message": "Meal name is required"  }}
```

---

## 401 Unauthorized

```
{  "success": false,  "error": {    "code": "UNAUTHORIZED",    "message": "Authentication required"  }}
```

---

## 403 Forbidden

```
{  "success": false,  "error": {    "code": "FORBIDDEN",    "message": "Access denied"  }}
```

---

## 404 Not Found

```
{  "success": false,  "error": {    "code": "NOT_FOUND",    "message": "Resource not found"  }}
```

---

## 409 Conflict

```
{  "success": false,  "error": {    "code": "CONFLICT",    "message": "Weekly plan already exists"  }}
```

---

## 500 Internal Server Error

```
{  "success": false,  "error": {    "code": "INTERNAL_ERROR",    "message": "Unexpected server error"  }}
```

---

# Pagination Standard

All collection endpoints support:

```
?page=1&pageSize=20
```

Constraints:

```
page >= 1pageSize 1-100default pageSize = 20
```

Response:

```
{  "data": [],  "meta": {    "page": 1,    "pageSize": 20,    "totalItems": 125,    "totalPages": 7  }}
```

---

# Authorization Matrix

| Resource               | Owner | Member |
| ---------------------- | ----- | ------ |
| View Household         | Yes   | Yes    |
| Edit Household         | Yes   | No     |
| Invite Members         | Yes   | No     |
| Create Weekly Plan     | Yes   | Yes    |
| Manage Meals           | Yes   | Yes    |
| Manage Grocery Lists   | Yes   | Yes    |
| Manage Chores          | Yes   | Yes    |
| Manage Budgets         | Yes   | Yes    |
| Assign Ownership Areas | Yes   | No     |