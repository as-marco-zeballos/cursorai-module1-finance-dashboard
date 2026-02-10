# Personal Finance Control Database

This directory contains the complete database schema for a Personal Finance Control system that tracks daily expenses and manages financial advice from internet resources. It is designed to run on **PostgreSQL** and is ready for **Supabase**.

## Files

|          File          |                                   Purpose                                          |
|------------------------|------------------------------------------------------------------------------------|
| **`schema.sql`**       | Full PostgreSQL schema: tables, indexes, triggers, views                           |
| **`seed-demo.sql`**    | Demo user and default expense categories (optional; set `DEMO_USER_ID` in app env) |
| **`supabase-rls.sql`** | Supabase Row Level Security (RLS) and optional Auth integration                    |
| **`ARCHITECTURE.md`**  | Design decisions and architecture notes                                            |
| **`ER_DIAGRAM.md`**    | Entity Relationship Diagram                                                        |
| **`types.ts`**         | TypeScript types aligned with the schema                                           |

---

## Supabase setup (recommended)

The schema is compatible with Supabase. Use these steps to create the database and secure it with RLS.

### Prerequisites

- A [Supabase](https://supabase.com) account
- (Optional) Supabase CLI for local migrations

### Step 1: Create a Supabase project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and sign in.
2. Click **New project**.
3. Choose organization, set **Project name** (e.g. `personal-finance`), **Database password**, and **Region**.
4. Click **Create new project** and wait until the project is ready.

### Step 2: Run the main schema

1. In the Supabase Dashboard, open your project.
2. Go to **SQL Editor**.
3. Click **New query**.
4. Copy the full contents of **`database/schema.sql`** and paste into the editor.
5. Click **Run** (or press Ctrl+Enter).
6. Confirm there are no errors. All tables, indexes, triggers, and views should be created.

### Step 3: Enable Row Level Security (RLS)

1. In **SQL Editor**, open another **New query**.
2. Copy the full contents of **`database/supabase-rls.sql`** and paste into the editor.
3. Click **Run**.
4. RLS is now enabled on user-scoped tables; users will only see and change their own data when using the Supabase client with a valid session.

### Step 4: Get your project URL and keys

1. In the Dashboard, go to **Project Settings** (gear icon) → **API**.
2. Note: (under the "Legacy anon, service_role API keys" tab)
   - **Project URL** (e.g. `https://xxxxx.supabase.co`)
   - **anon (public) key** – use in the browser / Next.js client.
   - **service_role key** – use only on the server, never expose to the client.

### Step 5: Configure environment variables

In your Next.js app root, create or edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DEMO_USER_ID=00000000-0000-0000-0000-000000000001
```

Use `NEXT_PUBLIC_*` only for the Supabase client in the browser; use `SUPABASE_SERVICE_ROLE_KEY` only in server-side code (API routes, server actions). If you run **`seed-demo.sql`** (after `schema.sql`), use the same `DEMO_USER_ID` as in that seed so the app can create and list expenses for the demo user.

### Step 6: Install Supabase client

From the project root (or inside the app directory):

```bash
npm install @supabase/supabase-js
```

### Step 7: Use Supabase in your app

**Client-side (with auth):**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// After user signs in, RLS uses auth.uid() automatically
const { data: expenses } = await supabase
  .from('expenses')
  .select('*, expense_categories(name), payment_methods(name)')
  .eq('expense_date', new Date().toISOString().slice(0, 10))
  .order('created_at', { ascending: false });
```

**Server-side (e.g. API route with service role for admin/imports):**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
// Bypasses RLS – use only for trusted server logic (e.g. seeding advice_sources)
```

### Optional: Supabase Auth and `public.users`

If you use **Supabase Auth** (email/password, OAuth, magic link):

1. In **`database/supabase-rls.sql`**, uncomment the block **“1. OPTIONAL: Make users table compatible with Supabase Auth”**.
2. Run that block in the SQL Editor (e.g. in a new query).
3. This will:
   - Make `password_hash` and `username` optional on `users`.
   - Add a trigger so that each new row in `auth.users` creates or updates a row in `public.users` with the same `id` (and email, full_name, username from metadata).

Then `auth.uid()` in RLS will match `public.users.id`, and your app can use Supabase Auth for login/signup while storing extra profile data in `public.users`.

### Supabase checklist

- [ ] Project created in Supabase Dashboard  
- [ ] `schema.sql` run in SQL Editor  
- [ ] `supabase-rls.sql` run in SQL Editor  
- [ ] Project URL and anon key in `.env.local`  
- [ ] Service role key in `.env.local` (server-only)  
- [ ] `@supabase/supabase-js` installed  
- [ ] (Optional) Auth sync block in `supabase-rls.sql` applied if using Supabase Auth  

---

## Core features

### Daily expense tracking

- Store amount, date, category, payment method, description, receipt URL, location, tags, notes.
- Recurring expense patterns and multi-currency support.

### Financial advice from the internet

- Tables for advice sources and advice items (content, URL, category, tags, relevance score).
- User interactions (read, bookmark, etc.) and RLS so users only see their own or public advice.

### Other features

- Budgets, financial goals, accounts, category hierarchy, payment methods.

---

## Core tables (overview)

|        Table           | Purpose                                 |
|------------------------|-----------------------------------------|
| `users`                | User/profile and preferences            |
| `expenses`             | Daily expense records                   |
| `expense_categories`   | Category tree for expenses              |
| `payment_methods`      | How expenses were paid                  |
| `financial_advice`     | Stored advice (from internet or app)    |
| `advice_sources`       | Source of advice (site, API, RSS, etc.) |
| `advice_interactions`  | User read/bookmark/etc. on advice       |
| `budgets`              | Budget limits and periods               |
| `financial_goals`      | Savings/debt/investment goals           |
| `accounts`             | Wallets/accounts and balances           |
| `account_transactions` | Transaction history per account         |

---

## Local PostgreSQL / Docker (alternative to Supabase)

If you prefer to run PostgreSQL yourself:

### Prerequisites

- PostgreSQL 12+ (or use Docker).

### Run schema locally

```bash
# Create DB and run schema
createdb personal_finance
psql -U your_user -d personal_finance -f database/schema.sql
```

### Run schema in Docker

```bash
docker run --name finance-db \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=personal_finance \
  -p 5432:5432 \
  -d postgres:15

docker exec -i finance-db psql -U postgres -d personal_finance < database/schema.sql
```

For local PostgreSQL you typically do **not** run `supabase-rls.sql` (RLS is optional and tuned for Supabase + `auth.uid()`).

---

## Example queries (Supabase / SQL)

### Insert a daily expense (use Supabase client with auth so `user_id` is set by RLS or app)

```sql
INSERT INTO expenses (user_id, category_id, payment_method_id, amount, currency, description, expense_date)
VALUES (
  auth.uid(),  -- when using Supabase Auth
  'category-uuid-here',
  'payment-method-uuid-here',
  29.99,
  'USD',
  'Lunch at restaurant',
  CURRENT_DATE
);
```

### Today’s expenses

```sql
SELECT e.*, ec.name AS category, pm.name AS payment_method
FROM expenses e
LEFT JOIN expense_categories ec ON e.category_id = ec.id
LEFT JOIN payment_methods pm ON e.payment_method_id = pm.id
WHERE e.user_id = auth.uid()
  AND e.expense_date = CURRENT_DATE
ORDER BY e.created_at DESC;
```

### Insert financial advice (e.g. from backend with service role)

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

---

## Integration with Next.js

Use the TypeScript types from **`database/types.ts`** with the Supabase client:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Expense, CreateExpenseDTO } from './database/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Example: insert expense (user_id from auth.uid() in RLS or set in app)
const newExpense: CreateExpenseDTO = {
  amount: 29.99,
  currency: 'USD',
  description: 'Lunch',
  expense_date: new Date().toISOString().slice(0, 10),
};
const { data, error } = await supabase.from('expenses').insert(newExpense).select().single();
```

---

## Next steps

1. Run **`schema.sql`** and **`supabase-rls.sql`** on Supabase (or run only `schema.sql` for local PostgreSQL).
2. Configure Supabase URL and keys in `.env.local` and install `@supabase/supabase-js`.
3. Implement auth (Supabase Auth recommended if using Supabase).
4. Build API routes or server actions for expenses and financial advice.
5. Add UI for expense entry, categories, and advice display.
6. Optionally add jobs or scripts to fetch and store financial advice from the internet (using the service role key where needed).

For more detail on the schema and design, see **`ARCHITECTURE.md`** and **`ER_DIAGRAM.md`**.
