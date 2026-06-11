# HOS - Authorization & Permission Model

Version: 1.0
Status: Approved for MVP Implementation
Phase: Security Design

---

# Purpose

Defines authorization rules for HomeOS MVP.

Authorization occurs after authentication and before business rule validation.

---

# Roles

OWNER

MEMBER

---

# Permission Enumeration

```typescript
export enum Permission {
  HOUSEHOLD_VIEW,
  HOUSEHOLD_EDIT,

  MEMBER_INVITE,
  MEMBER_VIEW,

  OWNERSHIP_VIEW,
  OWNERSHIP_MANAGE,

  PLAN_VIEW,
  PLAN_EDIT,

  MEAL_VIEW,
  MEAL_MANAGE,

  GROCERY_VIEW,
  GROCERY_MANAGE,

  CHORE_VIEW,
  CHORE_MANAGE,

  BUDGET_VIEW,
  BUDGET_MANAGE,
  PURCHASE_CREATE
}
```

---

# Role Matrix

|Permission|Owner|Member|
|---|---|---|
|HOUSEHOLD_VIEW|Yes|Yes|
|HOUSEHOLD_EDIT|Yes|No|
|MEMBER_VIEW|Yes|Yes|
|MEMBER_INVITE|Yes|No|
|OWNERSHIP_VIEW|Yes|Yes|
|OWNERSHIP_MANAGE|Yes|No|
|PLAN_VIEW|Yes|Yes|
|PLAN_EDIT|Yes|Yes|
|MEAL_VIEW|Yes|Yes|
|MEAL_MANAGE|Yes|Yes|
|GROCERY_VIEW|Yes|Yes|
|GROCERY_MANAGE|Yes|Yes|
|CHORE_VIEW|Yes|Yes|
|CHORE_MANAGE|Yes|Yes|
|BUDGET_VIEW|Yes|Yes|
|BUDGET_MANAGE|Yes|No|
|PURCHASE_CREATE|Yes|Yes|

---

# Authorization Flow

1. Authenticate User
2. Verify Membership
3. Load User Role
4. Resolve Permissions
5. Authorize Action

---

# Permission Service

```
export interface PermissionService {  hasPermission(    role: HouseholdRole,    permission: Permission  ): boolean;}
```

---

# Household Membership Guard

Every request must verify:

User Exists

AND

User Belongs To Household

Failure:

403 FORBIDDEN

---

# Owner-Only Actions

- Edit Household
- Invite Members
- Manage Ownership Assignments
- Create Budget
- Update Budget

---

# Member Restrictions

Members may:

- Plan Meals
- Manage Chores
- Manage Grocery Lists
- Record Purchases

Members may not:

- Rename Household
- Invite Members
- Assign Ownership Areas
- Modify Budgets

---

# Route Handler Pattern

```
authorize(  role,  Permission.MEMBER_INVITE);
```

Never:

```
if (role === "OWNER")
```

directly inside route handlers.