-- ============================================================================
-- Demo seed: one user and default expense categories
-- Run after schema.sql. Set DEMO_USER_ID in .env to the UUID below.
-- ============================================================================

-- Demo user (password is 'demo' - bcrypt hash)
-- Use only in development. For production, use Supabase Auth.
INSERT INTO users (id, email, username, password_hash, full_name, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@localhost',
  'demo',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'Demo User',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- Default expense categories for demo user
INSERT INTO expense_categories (user_id, name, is_system)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Food & Dining', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'Groceries', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'Transportation', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'Shopping', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'Entertainment', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'Bills & Utilities', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'Health', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'Personal Care', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'Subscriptions', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'Travel', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'Education', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'Other', TRUE)
ON CONFLICT (user_id, name) DO NOTHING;
