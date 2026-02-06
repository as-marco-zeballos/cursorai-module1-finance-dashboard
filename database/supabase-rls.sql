-- ============================================================================
-- Supabase: Row Level Security (RLS) & Auth Integration
-- ============================================================================
-- Run this AFTER schema.sql when deploying to Supabase.
-- Enables RLS so users only access their own data.
-- Optional: syncs public.users with auth.users (Supabase Auth).
-- ============================================================================

-- ============================================================================
-- 1. OPTIONAL: Make users table compatible with Supabase Auth
-- ============================================================================
-- If you use Supabase Auth (email, OAuth, etc.), uncomment the following:
-- - password_hash becomes optional (auth is handled by Supabase)
-- - Trigger creates/updates public.users when someone signs up

-- ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
-- ALTER TABLE users ALTER COLUMN username DROP NOT NULL;
-- CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users(username) WHERE username IS NOT NULL;

-- Function: create or update public.users from auth.users
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO public.users (id, email, full_name, username)
--   VALUES (
--     NEW.id,
--     NEW.email,
--     COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
--     COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
--   )
--   ON CONFLICT (id) DO UPDATE SET
--     email = EXCLUDED.email,
--     full_name = COALESCE(EXCLUDED.full_name, users.full_name),
--     updated_at = CURRENT_TIMESTAMP;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: run on every new signup (requires Supabase Auth)
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 2. ENABLE ROW LEVEL SECURITY ON ALL USER-SCOPED TABLES
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_advice ENABLE ROW LEVEL SECURITY;
ALTER TABLE advice_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_transactions ENABLE ROW LEVEL SECURITY;

-- advice_sources: often shared (read-only for all, write for service role)
ALTER TABLE advice_sources ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. RLS POLICIES (using auth.uid() as current user)
-- ============================================================================
-- When using Supabase Auth, ensure public.users.id = auth.uid() for each user.

-- USERS: users can read and update their own row only
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Allow insert so app or trigger can create profile (id must match auth.uid())
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

-- EXPENSE_CATEGORIES: CRUD for own rows
CREATE POLICY "Users can manage own categories"
  ON expense_categories FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- PAYMENT_METHODS: CRUD for own rows
CREATE POLICY "Users can manage own payment methods"
  ON payment_methods FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- EXPENSES: CRUD for own rows
CREATE POLICY "Users can manage own expenses"
  ON expenses FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- FINANCIAL_ADVICE: read own or public (user_id IS NULL); insert/update/delete own or public
CREATE POLICY "Users can read own or public advice"
  ON financial_advice FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can insert own advice"
  ON financial_advice FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update own advice"
  ON financial_advice FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own advice"
  ON financial_advice FOR DELETE
  USING (user_id = auth.uid());

-- ADVICE_INTERACTIONS: CRUD for own rows
CREATE POLICY "Users can manage own advice interactions"
  ON advice_interactions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- BUDGETS: CRUD for own rows
CREATE POLICY "Users can manage own budgets"
  ON budgets FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- FINANCIAL_GOALS: CRUD for own rows
CREATE POLICY "Users can manage own goals"
  ON financial_goals FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ACCOUNTS: CRUD for own rows
CREATE POLICY "Users can manage own accounts"
  ON accounts FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ACCOUNT_TRANSACTIONS: users can only access transactions for their accounts
CREATE POLICY "Users can read own account transactions"
  ON account_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = account_transactions.account_id
      AND accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own account transactions"
  ON account_transactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = account_transactions.account_id
      AND accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own account transactions"
  ON account_transactions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = account_transactions.account_id
      AND accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own account transactions"
  ON account_transactions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = account_transactions.account_id
      AND accounts.user_id = auth.uid()
    )
  );

-- ADVICE_SOURCES: allow read for all authenticated; insert/update/delete via service role only (no policy = only service role)
CREATE POLICY "Authenticated users can read advice sources"
  ON advice_sources FOR SELECT
  TO authenticated
  USING (true);

-- Optional: allow authenticated users to insert sources (e.g. for admin). Otherwise use service role.
-- CREATE POLICY "Authenticated users can insert advice sources"
--   ON advice_sources FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================================
-- 4. SERVICE ROLE BYPASS (optional)
-- ============================================================================
-- Supabase service_role key bypasses RLS by default. No extra policy needed.
-- Use service_role for: seeding advice_sources, server-side jobs, admin APIs.
