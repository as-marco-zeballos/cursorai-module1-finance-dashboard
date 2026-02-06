# Personal Finance Control Database

## Quick Start

This directory contains the complete database schema for a Personal Finance Control system that tracks daily expenses and manages financial advice from internet resources.

## Files

- **`schema.sql`** - Complete PostgreSQL database schema with tables, indexes, triggers, and views
- **`ARCHITECTURE.md`** - Detailed architecture documentation explaining design decisions
- **`ER_DIAGRAM.md`** - Visual Entity Relationship Diagram and relationship explanations
- **`types.ts`** - TypeScript type definitions matching the database schema

## Core Features

### ✅ Daily Expense Tracking
- Record expenses with amount, date, category, and payment method
- Support for receipts, locations, tags, and notes
- Recurring expense patterns
- Multi-currency support

### ✅ Financial Advice Management
- Store financial advice from internet sources
- Track sources (websites, APIs, RSS feeds, newsletters)
- Categorize and tag advice
- Relevance scoring for AI/ML recommendations
- User interactions (read, bookmark, share)

### ✅ Additional Features
- Budget tracking
- Financial goals
- Account/wallet management
- Category hierarchy
- Payment method tracking

## Database Setup

### Prerequisites
- PostgreSQL 12+ (recommended: PostgreSQL 14+)
- UUID extension enabled

### Installation

1. **Create database**:
```sql
CREATE DATABASE personal_finance;
\c personal_finance;
```

2. **Enable UUID extension**:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- OR for PostgreSQL 13+
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

3. **Run schema**:
```bash
psql -U your_user -d personal_finance -f schema.sql
```

### Using with Docker

```bash
# Start PostgreSQL container
docker run --name finance-db \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=personal_finance \
  -p 5432:5432 \
  -d postgres:14

# Run schema
docker exec -i finance-db psql -U postgres -d personal_finance < schema.sql
```

## Core Tables Overview

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `users` | User management | Authentication, preferences |
| `expenses` | **Daily expense tracking** | Amount, date, category, payment method, tags |
| `expense_categories` | Expense categorization | Hierarchical categories |
| `payment_methods` | Payment tracking | Credit card, cash, digital wallets |
| `financial_advice` | **Financial advice storage** | Content, URL, category, relevance score |
| `advice_sources` | Advice source tracking | Websites, APIs, RSS feeds |
| `advice_interactions` | User interactions | Read, bookmark, share |

## Example Queries

### Add a daily expense
```sql
INSERT INTO expenses (user_id, category_id, payment_method_id, amount, currency, description, expense_date)
VALUES (
  'user-uuid-here',
  'category-uuid-here',
  'payment-method-uuid-here',
  29.99,
  'USD',
  'Lunch at restaurant',
  CURRENT_DATE
);
```

### Get today's expenses
```sql
SELECT e.*, ec.name AS category, pm.name AS payment_method
FROM expenses e
LEFT JOIN expense_categories ec ON e.category_id = ec.id
LEFT JOIN payment_methods pm ON e.payment_method_id = pm.id
WHERE e.user_id = 'user-uuid-here'
  AND e.expense_date = CURRENT_DATE
ORDER BY e.created_at DESC;
```

### Add financial advice from internet
```sql
INSERT INTO financial_advice (source_id, title, content, excerpt, url, category, tags, relevance_score)
VALUES (
  'source-uuid-here',
  '10 Tips for Better Budgeting',
  'Full article content...',
  'Short summary...',
  'https://example.com/budgeting-tips',
  'budgeting',
  ARRAY['budgeting', 'saving', 'tips'],
  0.85
);
```

### Get relevant financial advice
```sql
SELECT fa.*, fs.name AS source_name
FROM financial_advice fa
JOIN advice_sources fs ON fa.source_id = fs.id
WHERE (fa.user_id = 'user-uuid-here' OR fa.user_id IS NULL)
  AND fa.is_archived = FALSE
  AND fa.relevance_score > 0.7
ORDER BY fa.relevance_score DESC
LIMIT 20;
```

## Integration with Next.js

The `types.ts` file provides TypeScript interfaces that match the database schema. Use these types in your Next.js application:

```typescript
import { Expense, FinancialAdvice, CreateExpenseDTO } from '@/database/types';

// Example API route
export async function POST(request: Request) {
  const expense: CreateExpenseDTO = await request.json();
  // Insert into database using your ORM (Prisma, Drizzle, etc.)
}
```

## Recommended ORM/Query Builder

- **Prisma**: Excellent TypeScript support, auto-generated types
- **Drizzle ORM**: Lightweight, type-safe SQL query builder
- **Kysely**: Type-safe SQL query builder
- **TypeORM**: Full-featured ORM with TypeScript support

## Next Steps

1. Choose and set up your ORM/query builder
2. Create API routes for expense CRUD operations
3. Create API routes for financial advice management
4. Implement authentication (JWT, sessions)
5. Build UI components for expense entry and advice display
6. Set up web scraping/crawling for financial advice collection

## Support

For detailed architecture information, see `ARCHITECTURE.md`.  
For visual relationships, see `ER_DIAGRAM.md`.
