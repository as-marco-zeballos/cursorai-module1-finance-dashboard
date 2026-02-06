# Entity Relationship Diagram (ERD)

## Visual Representation

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ PK id (UUID)    │
│    email        │
│    username     │
│    password_hash│
│    full_name    │
│    preferences  │
│    created_at   │
│    updated_at   │
│    is_active    │
└────────┬────────┘
         │
         │ 1:N
         │
    ┌────┴─────────────────────────────────────────────────────────────┐
    │                                                                   │
    │                                                                   │
┌───▼──────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │
│ EXPENSE_CATEGORIES│  │ PAYMENT_METHODS │  │      EXPENSES        │  │
├──────────────────┤  ├──────────────────┤  ├──────────────────────┤  │
│ PK id (UUID)     │  │ PK id (UUID)     │  │ PK id (UUID)         │  │
│ FK user_id       │  │ FK user_id       │  │ FK user_id           │  │
│    name          │  │    name          │  │ FK category_id       │  │
│    description   │  │    type          │  │ FK payment_method_id │  │
│ FK parent_cat_id │  │    account_last4 │  │    amount            │  │
│    icon          │  │    bank_name     │  │    currency          │  │
│    color         │  │    is_active     │  │    description       │  │
│    is_system     │  │    created_at   │  │    expense_date      │  │
│    created_at    │  │    updated_at   │  │    receipt_url       │  │
│    updated_at    │  └────────┬─────────┘  │    location         │  │
└────────┬─────────┘           │            │    tags[]           │  │
         │                     │            │    notes            │  │
         │ 1:N                 │ 1:N        │    is_recurring     │  │
         │                     │            │    recurring_pattern│  │
         │                     │            │    metadata         │  │
         │                     │            │    created_at       │  │
         │                     │            │    updated_at       │  │
         │                     │            └──────────┬───────────┘  │
         │                     │                       │              │
         │                     │                       │ 1:N          │
         │                     │                       │              │
         │                     │              ┌────────▼──────────┐   │
         │                     │              │ ACCOUNT_TRANSACTIONS│  │
         │                     │              ├────────────────────┤   │
         │                     │              │ PK id (UUID)      │   │
         │                     │              │ FK account_id     │   │
         │                     │              │ FK expense_id     │   │
         │                     │              │    transaction_type│   │
         │                     │              │    amount         │   │
         │                     │              │    transaction_date│   │
         │                     │              │    balance_after  │   │
         │                     │              └────────────────────┘   │
         │                     │                                       │
         │                     │                                       │
┌────────▼─────────┐  ┌───────▼──────────┐  ┌──────────────────────┐ │
│    BUDGETS       │  │ FINANCIAL_GOALS  │  │      ACCOUNTS        │ │
├──────────────────┤  ├──────────────────┤  ├──────────────────────┤ │
│ PK id (UUID)     │  │ PK id (UUID)     │  │ PK id (UUID)        │ │
│ FK user_id       │  │ FK user_id       │  │ FK user_id          │ │
│ FK category_id   │  │    title         │  │    name             │ │
│    name          │  │    description   │  │    account_type     │ │
│    amount        │  │    target_amount │  │    balance          │ │
│    currency      │  │    current_amount│  │    currency         │ │
│    period_type   │  │    currency      │  │    bank_name        │ │
│    start_date    │  │    target_date   │  │    account_last4    │ │
│    end_date      │  │    goal_type     │  │    is_active        │ │
│    is_active     │  │    status        │  │    created_at       │ │
│    created_at    │  │    created_at   │  │    updated_at       │ │
│    updated_at    │  │    updated_at   │  └──────────┬───────────┘ │
└──────────────────┘  └──────────────────┘            │              │
                                                       │ 1:N          │
                                                       │              │
                                                       │              │
┌──────────────────────┐  ┌──────────────────────────┐              │
│   ADVICE_SOURCES     │  │   FINANCIAL_ADVICE       │              │
├──────────────────────┤  ├──────────────────────────┤              │
│ PK id (UUID)         │  │ PK id (UUID)             │              │
│    name              │  │ FK source_id             │              │
│    url               │  │ FK user_id (nullable)    │              │
│    source_type       │  │    title                 │              │
│    description       │  │    content               │              │
│    is_active         │  │    excerpt               │              │
│    created_at        │  │    url                  │              │
│    updated_at        │  │    author               │              │
└──────────┬───────────┘  │    published_date       │              │
           │              │    fetched_date          │              │
           │ 1:N          │    category              │              │
           │              │    tags[]                │              │
           │              │    relevance_score       │              │
           │              │    is_read               │              │
           │              │    is_bookmarked         │              │
           │              │    is_archived           │              │
           │              │    metadata              │              │
           │              │    created_at            │              │
           │              │    updated_at            │              │
           │              └──────────┬───────────────┘              │
           │                        │                               │
           │                        │ 1:N                          │
           │                        │                               │
           │              ┌──────────▼───────────────┐              │
           │              │  ADVICE_INTERACTIONS     │              │
           │              ├──────────────────────────┤              │
           │              │ PK id (UUID)             │              │
           │              │ FK user_id               │              │
           │              │ FK advice_id             │              │
           │              │    interaction_type      │              │
           │              │    notes                 │              │
           │              │    created_at            │              │
           │              │ UNIQUE(user, advice, type)│              │
           │              └──────────────────────────┘              │
           │                                                        │
           └────────────────────────────────────────────────────────┘
```

## Relationship Summary

### One-to-Many Relationships (1:N)

1. **Users → Expense Categories**: One user can have many categories
2. **Users → Payment Methods**: One user can have many payment methods
3. **Users → Expenses**: One user can have many expenses
4. **Users → Financial Advice**: One user can have many advice entries (or NULL for public)
5. **Users → Advice Interactions**: One user can interact with many advice items
6. **Users → Budgets**: One user can have many budgets
7. **Users → Financial Goals**: One user can have many goals
8. **Users → Accounts**: One user can have many accounts
9. **Expense Categories → Expenses**: One category can have many expenses
10. **Expense Categories → Expense Categories**: Self-referencing (parent-child hierarchy)
11. **Expense Categories → Budgets**: One category can have many budgets
12. **Payment Methods → Expenses**: One payment method can be used for many expenses
13. **Advice Sources → Financial Advice**: One source can provide many advice items
14. **Financial Advice → Advice Interactions**: One advice item can have many interactions
15. **Accounts → Account Transactions**: One account can have many transactions
16. **Expenses → Account Transactions**: One expense can link to one transaction (optional)

### Key Constraints

- **Unique Constraints**:
  - `users.email` - unique
  - `users.username` - unique
  - `expense_categories(user_id, name)` - unique per user
  - `payment_methods(user_id, name)` - unique per user
  - `advice_sources.url` - unique
  - `advice_interactions(user_id, advice_id, interaction_type)` - unique

- **Check Constraints**:
  - `expenses.amount > 0`
  - `budgets.amount > 0`
  - `financial_goals.target_amount > 0`
  - `financial_goals.current_amount >= 0`
  - `financial_advice.relevance_score BETWEEN 0 AND 1`

- **Foreign Key Cascades**:
  - Most FKs use `ON DELETE CASCADE` for data integrity
  - `expense_categories.parent_category_id` uses `ON DELETE SET NULL` to preserve child categories

## Index Strategy

### Primary Indexes (on PKs)
- All tables have UUID primary keys with automatic indexes

### Foreign Key Indexes
- All foreign keys are indexed for join performance

### Composite Indexes
- `expenses(user_id, expense_date DESC)` - for user expense queries
- `budgets(user_id, is_active)` - for active budget queries
- `financial_goals(user_id, status)` - for goal status queries

### Special Indexes
- **GIN indexes** on array columns (`expenses.tags`, `financial_advice.tags`)
- **Hash index** on `financial_advice.url` for duplicate detection
- **Date indexes** on `expenses.expense_date`, `financial_advice.published_date`

## Data Flow Examples

### Expense Registration Flow
```
User → Expense Category → Expense → Payment Method
                              ↓
                    Account Transaction (optional)
```

### Financial Advice Flow
```
Advice Source → Financial Advice → Advice Interactions (by User)
```

### Budget Tracking Flow
```
User → Budget → Expense Category → Expenses (aggregated)
```
