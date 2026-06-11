# HomeOS Database Design Specification

Version: 1.1
Status: Approved for Prisma Schema Development
Phase: Database Design

------

# Budget Domain

## budgets

### Columns

| Column       | Type          |
| ------------ | ------------- |
| id           | UUID          |
| household_id | UUID          |
| month        | INTEGER       |
| year         | INTEGER       |
| amount       | DECIMAL(12,2) |
| created_at   | TIMESTAMP     |
| updated_at   | TIMESTAMP     |

### Constraints

```sql
UNIQUE(household_id, month, year)
```

### Foreign Keys

```sql
household_id → households.id
```

### Indexes

```sql
INDEX(household_id)
INDEX(month, year)
INDEX(household_id, year, month)
```

------

## purchases

### Purpose

Stores individual grocery spending transactions.

Although a Purchase belongs to a Budget, the Purchase also stores its Household directly.

This denormalization is intentional and supports:

- Faster reporting
- Budget summaries
- Household dashboards
- Future analytics
- Household health indicators

------

### Columns

| Column        | Type          |
| ------------- | ------------- |
| id            | UUID          |
| household_id  | UUID          |
| budget_id     | UUID          |
| amount        | DECIMAL(12,2) |
| purchase_date | DATE          |
| notes         | TEXT NULL     |
| created_at    | TIMESTAMP     |

------

### Foreign Keys

```sql
household_id → households.id

budget_id → budgets.id
```

------

### Business Rule

The following must always be true:

```text
purchase.household_id
=
budget.household_id
```

Validation should occur in:

- Application layer
- Repository layer
- Integration tests

------

### Indexes

```sql
INDEX(household_id)

INDEX(budget_id)

INDEX(purchase_date)

INDEX(household_id, purchase_date)

INDEX(household_id, purchase_date DESC)

INDEX(household_id, budget_id)
```

------

### Reporting Examples

Monthly household spending:

```sql
SELECT SUM(amount)
FROM purchases
WHERE household_id = ?
AND purchase_date BETWEEN ? AND ?;
```

No budget join required.

------

# Future Reporting Support

The MVP intentionally preserves historical records to support future reporting.

------

## Household Spending History

Query Pattern

```sql
Household
    →
Purchases
```

Supported directly through:

```sql
purchases.household_id
```

------

## Household Health Indicators

Version 1.1 roadmap introduces:

- Planning consistency
- Chore completion consistency
- Food spending visibility
- Weekly preparation score

Current schema supports all required calculations.

------

## Historical Planning Analytics

Supported metrics:

- Weekly plans created
- Weekly plans completed
- Priorities completed
- Chore completion rate
- Grocery generation frequency
- Budget adherence

No schema changes required.

------

# Recommended Database Views

Views are optional for MVP but recommended after launch.

------

## v_monthly_food_spending

```sql
CREATE VIEW v_monthly_food_spending AS
SELECT
    household_id,
    DATE_TRUNC('month', purchase_date) AS month,
    SUM(amount) AS total_spent
FROM purchases
GROUP BY
    household_id,
    DATE_TRUNC('month', purchase_date);
```

------

## v_budget_remaining

```sql
CREATE VIEW v_budget_remaining AS
SELECT
    b.id,
    b.household_id,
    b.month,
    b.year,
    b.amount,
    COALESCE(SUM(p.amount), 0) AS spent,
    b.amount - COALESCE(SUM(p.amount), 0) AS remaining
FROM budgets b
LEFT JOIN purchases p
    ON p.budget_id = b.id
GROUP BY
    b.id;
```

------

## v_overdue_chores

```sql
CREATE VIEW v_overdue_chores AS
SELECT
    co.*
FROM chore_occurrences co
WHERE
    co.completed_at IS NULL
    AND co.due_date < CURRENT_DATE;
```

------

# Prisma Modeling Update

## Purchase Model

```prisma
model Purchase {
  id           String   @id @default(uuid())

  householdId  String
  budgetId     String

  amount       Decimal
  purchaseDate DateTime
  notes        String?

  createdAt    DateTime @default(now())

  household    Household @relation(fields: [householdId], references: [id])
  budget       Budget    @relation(fields: [budgetId], references: [id])

  @@index([householdId])
  @@index([budgetId])
  @@index([purchaseDate])
  @@index([householdId, purchaseDate])
  @@index([householdId, budgetId])
}
```

------

# Architectural Decision Record

ADR-005

Store household_id directly on Purchase.

Reason:

- Reporting optimization
- Analytics readiness
- Reduced query complexity
- Future dashboard performance
- Avoids expensive joins for common spending queries

Status:

Accepted

------

# Database Design Approval Statement

Version 1.1 supersedes Version 1.0.

This schema is now optimized for:

- MVP delivery
- Future analytics
- Household health metrics
- Reporting workloads
- Prisma implementation

Approved to proceed into:

1. Prisma Schema Design
2. Database Migration Design
3. Repository Layer Implementation
4. REST API Development
5. MVP Construction

End of Document