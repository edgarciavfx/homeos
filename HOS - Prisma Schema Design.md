HOS - Prisma Schema Specification
Version: 1.1
Status: Approved for MVP Implementation
Phase: Database Implementation Design

Purpose
This version supersedes v1.0 and incorporates implementation hardening recommendations identified during schema review.

Enhancements Over v1.0
Authentication Readiness
Auth.js compatible models

Account model

Session model

VerificationToken model

Historical Traceability
Soft-delete support for aggregate roots

Audit timestamps throughout the schema

Query Optimization
Dashboard indexes

Reporting indexes

Household-scoped composite indexes

Domain Consistency
Explicit relation names

Ownership relations clarified

Recommendation workflow extensibility

Future Expansion Support
Calendar integrations

Household health metrics

Analytics workloads

Recommendation engine evolution

New Global Modeling Standards
Aggregate Roots
The following entities support soft deletion:

Household
WeeklyPlan
Meal
Chore
Budget
Required field:

deletedAt DateTime?
Audit Fields
Aggregate Roots:

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
deletedAt DateTime?
Child Entities:

createdAt DateTime @default(now())
Auth.js Models
Account
model Account {
  id                 String @id @default(cuid())
  userId             String
​
  type               String
  provider           String
  providerAccountId  String
​
  refresh_token      String?
  access_token       String?
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?
  session_state      String?
​
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
​
  @@unique([provider, providerAccountId])
}
Session
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
​
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
VerificationToken
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
​
  @@unique([identifier, token])
}
Additional Schema Improvements
Household
deletedAt DateTime?
​
@@index([createdAt])
WeeklyPlan
deletedAt DateTime?

@@index([householdId, status])
@@index([householdId, weekStartDate])
WeeklyPriority
@@index([weeklyPlanId, completed])
@@index([ownerId, completed])
Meal
deletedAt DateTime?

@@unique([householdId, name])
@@index([householdId, archived])
GroceryList
@@index([householdId, generatedAt])
GroceryItem
@@index([groceryListId, completed])
@@index([source])
Chore
deletedAt DateTime?

@@index([householdId, active])
@@index([ownerId, active])
ChoreOccurrence
@@index([dueDate])
@@index([completedAt])
@@index([choreId, dueDate])
Budget
deletedAt DateTime?

@@index([householdId, year, month])
Purchase
@@index([householdId, purchaseDate(sort: Desc)])
Recommended Database Constraints
Budget Amount
CHECK(amount >= 0)
Purchase Amount
CHECK(amount > 0)
Meal Preparation Minutes
CHECK(preparation_minutes >= 0)
Ingredient Quantity
CHECK(quantity > 0)
Dashboard Query Optimization
Supported Queries

Current Week Plan
Overdue Chores
Active Grocery List
Monthly Spending Summary
Budget Remaining
Household Ownership Overview
All required indexes are included in Version 1.1.

Architectural Decision Records
ADR-006

Introduce Auth.js models.

Reason:

Authentication infrastructure should be production-ready before implementation begins.

Status:

Accepted

ADR-007

Introduce soft deletion on aggregate roots.

Reason:

HomeOS prioritizes historical visibility and future analytics.

Status:

Accepted

ADR-008

Add reporting-focused indexes.

Reason:

Supports dashboard performance and future household health metrics.

Status:

Accepted

Approval Statement
Version 1.1 is the recommended implementation baseline for HomeOS MVP.

Approved for:

Prisma Schema Implementation

Migration Creation

Repository Development

API Development

Frontend Integration

Production Deployment Preparation