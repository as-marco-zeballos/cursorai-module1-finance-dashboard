# Personal Finance Control Database Architecture

## Overview

This document describes the database architecture for a Personal Finance Control system that tracks daily expenses and manages financial advice from internet resources.

## Design Principles

1. **Scalability**: Designed to support single-user initially but can scale to multi-user
2. **Flexibility**: JSONB fields allow for extensible metadata without schema changes
3. **Data Integrity**: Foreign keys, constraints, and triggers ensure data consistency
4. **Performance**: Strategic indexes on frequently queried columns
5. **Auditability**: Timestamps on all tables for tracking changes

## Core Entities

### 1. Users (`users`)
- **Purpose**: User management and authentication
- **Key Features**:
  - Email and username for authentication
  - Password hash storage (bcrypt)
  - JSONB preferences field for flexible user settings
  - Active/inactive status

### 2. Expense Categories (`expense_categories`)
- **Purpose**: Hierarchical categorization of expenses
- **Key Features**:
  - Parent-child relationships for subcategories
  - System vs user-created categories
  - Icon and color support for UI
  - User-specific categories

### 3. Payment Methods (`payment_methods`)
- **Purpose**: Track how expenses were paid
- **Key Features**:
  - Multiple payment types (credit card, cash, digital wallet, etc.)
  - Account identification (last 4 digits)
  - Bank information storage

### 4. Expenses (`expenses`) ⭐ **CORE TABLE**
- **Purpose**: Daily expense tracking
- **Key Features**:
  - Links to category and payment method
  - Multi-currency support
  - Receipt URL storage
  - Location tracking
  - Tag array for flexible categorization
  - Recurring expense support with pattern storage
  - JSONB metadata for extensibility

**Key Fields**:
- `amount`: Expense amount (DECIMAL for precision)
- `expense_date`: Date of expense (DATE type for efficient date queries)
- `currency`: ISO 4217 currency code
- `tags`: Array of strings for flexible tagging
- `recurring_pattern`: JSONB for storing recurrence rules

### 5. Financial Advice Sources (`advice_sources`)
- **Purpose**: Track where financial advice comes from
- **Key Features**:
  - Source URL tracking
  - Source type classification (website, API, RSS feed, newsletter)
  - Active/inactive status for source management

### 6. Financial Advice (`financial_advice`) ⭐ **CORE TABLE**
- **Purpose**: Store financial advice articles/resources from internet
- **Key Features**:
  - Full content storage
  - Excerpt for quick previews
  - Original URL preservation
  - Category and tag classification
  - Relevance scoring (0-1) for AI/ML ranking
  - Read/bookmark/archive status
  - User-specific or public advice
  - Published date vs fetched date tracking

**Key Fields**:
- `content`: Full article content or summary
- `url`: Original source URL (indexed for duplicate detection)
- `relevance_score`: AI/ML computed relevance (0-1)
- `category`: Predefined categories (budgeting, investing, saving, etc.)
- `tags`: Array for flexible categorization
- `metadata`: JSONB for storing images, structured data, etc.

### 7. Advice Interactions (`advice_interactions`)
- **Purpose**: Track user interactions with financial advice
- **Key Features**:
  - Multiple interaction types (read, bookmark, share, like, dismiss)
  - User notes on advice
  - Unique constraint prevents duplicate interactions

## Supporting Entities

### 8. Budgets (`budgets`)
- **Purpose**: Set and track spending limits
- **Key Features**:
  - Category-specific or general budgets
  - Multiple period types (daily, weekly, monthly, yearly)
  - Date range support

### 9. Financial Goals (`financial_goals`)
- **Purpose**: Track financial objectives
- **Key Features**:
  - Target vs current amount tracking
  - Multiple goal types (savings, debt payoff, investment, purchase)
  - Status tracking (active, completed, paused, cancelled)

### 10. Accounts (`accounts`)
- **Purpose**: Track account balances
- **Key Features**:
  - Multiple account types (checking, savings, credit card, investment, cash)
  - Balance tracking
  - Bank information

### 11. Account Transactions (`account_transactions`)
- **Purpose**: Detailed account transaction history
- **Key Features**:
  - Links to expenses
  - Balance snapshots
  - Transaction type classification

## Database Relationships

```
users
  ├── expense_categories (1:N)
  ├── payment_methods (1:N)
  ├── expenses (1:N) ⭐
  ├── financial_advice (1:N, optional - NULL = public)
  ├── advice_interactions (1:N)
  ├── budgets (1:N)
  ├── financial_goals (1:N)
  └── accounts (1:N)
      └── account_transactions (1:N)

expense_categories
  ├── expenses (1:N)
  ├── budgets (1:N)
  └── expense_categories (self-referencing for hierarchy)

payment_methods
  └── expenses (1:N)

advice_sources
  └── financial_advice (1:N) ⭐

expenses
  └── account_transactions (1:N, optional)
```

## Indexes Strategy

### Primary Indexes
- **Users**: Email and username (for authentication lookups)
- **Expenses**: User + date (for daily/monthly reports), category (for category analysis), tags (GIN index for array searches)
- **Financial Advice**: Source, user, category, published date, fetched date, URL hash (for duplicate detection)
- **Advice Interactions**: User + advice (for quick user-specific queries)

### Performance Considerations
- GIN indexes on array columns (tags) for efficient array queries
- Hash index on advice URL for fast duplicate detection
- Composite indexes on frequently queried combinations (user_id + date)

## Views

### 1. `monthly_expense_summary`
Aggregates expenses by user, month, and category for reporting.

### 2. `category_expense_summary`
Provides category-level expense statistics per user.

### 3. `advice_summary`
Aggregates financial advice statistics by source and category.

## Data Types Rationale

- **UUID**: Used for all primary keys (better for distributed systems, no sequential ID exposure)
- **DECIMAL(15, 2)**: For monetary amounts (precision for financial calculations)
- **TIMESTAMP WITH TIME ZONE**: All timestamps include timezone for global support
- **JSONB**: Flexible metadata storage without schema changes
- **TEXT[]**: Array type for tags (efficient PostgreSQL array operations)
- **DATE**: For expense dates (more efficient than TIMESTAMP for date-only queries)

## Security Considerations

1. **Password Storage**: Passwords stored as bcrypt hashes (never plain text)
2. **Data Isolation**: User-specific data filtered by `user_id` in all queries
3. **Soft Deletes**: Consider adding `deleted_at` columns for soft delete patterns
4. **Audit Trail**: All tables have `created_at` and `updated_at` for audit purposes

## Scalability Considerations

1. **Partitioning**: Consider partitioning `expenses` table by date range for large datasets
2. **Archiving**: Old financial advice can be archived (use `is_archived` flag)
3. **Read Replicas**: Views can be materialized for reporting workloads
4. **Caching**: Frequently accessed data (categories, payment methods) can be cached

## Future Enhancements

1. **Recurring Expenses**: Full CRON-like scheduling system
2. **Expense Templates**: Pre-defined expense templates for common purchases
3. **Expense Splitting**: Support for shared expenses (split bills)
4. **Multi-Currency Conversion**: Automatic currency conversion rates
5. **Expense Approval Workflow**: For shared accounts or family budgets
6. **AI Categorization**: ML model for automatic expense categorization
7. **Advice Recommendations**: ML-based advice recommendation engine
8. **Expense Predictions**: Forecasting based on historical data

## Migration Strategy

1. **Phase 1**: Core tables (users, expenses, categories, payment_methods)
2. **Phase 2**: Financial advice tables (sources, advice, interactions)
3. **Phase 3**: Supporting tables (budgets, goals, accounts)
4. **Phase 4**: Indexes and views optimization

## Example Queries

### Get daily expenses for a user
```sql
SELECT e.*, ec.name AS category_name, pm.name AS payment_method_name
FROM expenses e
LEFT JOIN expense_categories ec ON e.category_id = ec.id
LEFT JOIN payment_methods pm ON e.payment_method_id = pm.id
WHERE e.user_id = $1
  AND e.expense_date = CURRENT_DATE
ORDER BY e.created_at DESC;
```

### Get monthly expense summary
```sql
SELECT 
    category_name,
    SUM(total_amount) AS monthly_total,
    COUNT(expense_count) AS transaction_count
FROM monthly_expense_summary
WHERE user_id = $1
  AND month = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY category_name;
```

### Get relevant financial advice
```sql
SELECT fa.*, fs.name AS source_name
FROM financial_advice fa
JOIN advice_sources fs ON fa.source_id = fs.id
WHERE (fa.user_id = $1 OR fa.user_id IS NULL)
  AND fa.is_archived = FALSE
  AND fa.relevance_score > 0.7
ORDER BY fa.relevance_score DESC, fa.published_date DESC
LIMIT 20;
```

### Detect duplicate advice
```sql
SELECT url, COUNT(*) as duplicate_count
FROM financial_advice
GROUP BY url
HAVING COUNT(*) > 1;
```
