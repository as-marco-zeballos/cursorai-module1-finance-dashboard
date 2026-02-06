-- ============================================================================
-- Personal Finance Control Database Schema
-- ============================================================================
-- This schema supports daily expense tracking and financial advice management
-- from internet resources.
-- ============================================================================

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table (supports multi-user, but can be single-user)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- bcrypt hash
    full_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    preferences JSONB DEFAULT '{}'::jsonb -- Store user preferences (currency, date format, etc.)
);

-- Expense Categories (hierarchical support)
CREATE TABLE expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
    icon VARCHAR(50), -- Icon identifier for UI
    color VARCHAR(7), -- Hex color code
    is_system BOOLEAN DEFAULT FALSE, -- System categories vs user-created
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
);

-- Payment Methods
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., "Credit Card", "Cash", "Debit Card", "PayPal"
    type VARCHAR(50) NOT NULL, -- 'credit_card', 'debit_card', 'cash', 'digital_wallet', 'bank_transfer'
    account_number_last4 VARCHAR(4), -- Last 4 digits for identification
    bank_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
);

-- Daily Expenses (core table)
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
    payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'USD' NOT NULL, -- ISO 4217 currency code
    description TEXT,
    expense_date DATE NOT NULL, -- Date of the expense
    receipt_url VARCHAR(500), -- URL to receipt image/document
    location VARCHAR(255), -- Where the expense occurred
    tags TEXT[], -- Array of tags for flexible categorization
    notes TEXT, -- Additional notes
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_pattern JSONB, -- For recurring expenses: {"type": "monthly", "day": 15}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb -- Flexible storage for additional data
);

-- Financial Advice Sources
CREATE TABLE advice_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL, -- e.g., "Investopedia", "NerdWallet", "Personal Blog"
    url VARCHAR(500) UNIQUE NOT NULL, -- Base URL of the source
    source_type VARCHAR(50) NOT NULL, -- 'website', 'api', 'rss_feed', 'newsletter'
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Financial Advice Articles/Resources
CREATE TABLE financial_advice (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES advice_sources(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL = available to all users
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL, -- Full article content or summary
    excerpt TEXT, -- Short summary
    url VARCHAR(1000) NOT NULL, -- Original URL
    author VARCHAR(255),
    published_date TIMESTAMP WITH TIME ZONE,
    fetched_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    category VARCHAR(100), -- 'budgeting', 'investing', 'saving', 'debt', 'retirement', etc.
    tags TEXT[], -- Array of tags
    relevance_score DECIMAL(3, 2) CHECK (relevance_score >= 0 AND relevance_score <= 1), -- AI/ML relevance score
    is_read BOOLEAN DEFAULT FALSE,
    is_bookmarked BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb, -- Store additional metadata (images, structured data, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User's interaction with financial advice (reading, bookmarking, etc.)
CREATE TABLE advice_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    advice_id UUID REFERENCES financial_advice(id) ON DELETE CASCADE NOT NULL,
    interaction_type VARCHAR(50) NOT NULL, -- 'read', 'bookmark', 'share', 'like', 'dismiss'
    notes TEXT, -- User's personal notes about the advice
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, advice_id, interaction_type)
);

-- ============================================================================
-- SUPPORTING TABLES (Optional but recommended)
-- ============================================================================

-- Budgets
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES expense_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
    period_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Financial Goals
CREATE TABLE financial_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount DECIMAL(15, 2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(15, 2) DEFAULT 0 CHECK (current_amount >= 0),
    currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
    target_date DATE,
    goal_type VARCHAR(50) NOT NULL, -- 'savings', 'debt_payoff', 'investment', 'purchase'
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'paused', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Accounts/Wallets (for tracking balances)
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- 'checking', 'savings', 'credit_card', 'investment', 'cash'
    balance DECIMAL(15, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD' NOT NULL,
    bank_name VARCHAR(255),
    account_number_last4 VARCHAR(4),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Account Transactions (for account balance tracking)
CREATE TABLE account_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
    expense_id UUID REFERENCES expenses(id) ON DELETE SET NULL, -- Link to expense if applicable
    transaction_type VARCHAR(50) NOT NULL, -- 'debit', 'credit', 'transfer'
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    balance_after DECIMAL(15, 2), -- Snapshot of balance after transaction
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES (for performance optimization)
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Expense indexes
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category_id);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, expense_date DESC);
CREATE INDEX idx_expenses_tags ON expenses USING GIN(tags);

-- Category indexes
CREATE INDEX idx_categories_user_id ON expense_categories(user_id);
CREATE INDEX idx_categories_parent ON expense_categories(parent_category_id);

-- Financial Advice indexes
CREATE INDEX idx_advice_source ON financial_advice(source_id);
CREATE INDEX idx_advice_user ON financial_advice(user_id);
CREATE INDEX idx_advice_category ON financial_advice(category);
CREATE INDEX idx_advice_published_date ON financial_advice(published_date DESC);
CREATE INDEX idx_advice_fetched_date ON financial_advice(fetched_date DESC);
CREATE INDEX idx_advice_tags ON financial_advice USING GIN(tags);
CREATE INDEX idx_advice_url_hash ON financial_advice USING hash(url); -- For duplicate detection

-- Advice Interactions indexes
CREATE INDEX idx_interactions_user ON advice_interactions(user_id);
CREATE INDEX idx_interactions_advice ON advice_interactions(advice_id);
CREATE INDEX idx_interactions_type ON advice_interactions(interaction_type);

-- Budget indexes
CREATE INDEX idx_budgets_user ON budgets(user_id);
CREATE INDEX idx_budgets_category ON budgets(category_id);
CREATE INDEX idx_budgets_active ON budgets(user_id, is_active) WHERE is_active = TRUE;

-- Goals indexes
CREATE INDEX idx_goals_user ON financial_goals(user_id);
CREATE INDEX idx_goals_status ON financial_goals(user_id, status);

-- Account indexes
CREATE INDEX idx_accounts_user ON accounts(user_id);
CREATE INDEX idx_transactions_account ON account_transactions(account_id);
CREATE INDEX idx_transactions_date ON account_transactions(transaction_date);
CREATE INDEX idx_transactions_expense ON account_transactions(expense_id);

-- ============================================================================
-- TRIGGERS (for automatic timestamp updates)
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_categories_updated_at BEFORE UPDATE ON expense_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advice_sources_updated_at BEFORE UPDATE ON advice_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_advice_updated_at BEFORE UPDATE ON financial_advice
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_goals_updated_at BEFORE UPDATE ON financial_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS (for common queries)
-- ============================================================================

-- Monthly expense summary view
CREATE OR REPLACE VIEW monthly_expense_summary AS
SELECT 
    user_id,
    DATE_TRUNC('month', expense_date) AS month,
    category_id,
    COUNT(*) AS expense_count,
    SUM(amount) AS total_amount,
    AVG(amount) AS avg_amount,
    MIN(amount) AS min_amount,
    MAX(amount) AS max_amount
FROM expenses
GROUP BY user_id, DATE_TRUNC('month', expense_date), category_id;

-- Category expense summary view
CREATE OR REPLACE VIEW category_expense_summary AS
SELECT 
    e.user_id,
    ec.id AS category_id,
    ec.name AS category_name,
    COUNT(e.id) AS expense_count,
    SUM(e.amount) AS total_amount,
    AVG(e.amount) AS avg_amount,
    MIN(e.expense_date) AS first_expense_date,
    MAX(e.expense_date) AS last_expense_date
FROM expense_categories ec
LEFT JOIN expenses e ON ec.id = e.category_id
GROUP BY e.user_id, ec.id, ec.name;

-- Financial advice summary view
CREATE OR REPLACE VIEW advice_summary AS
SELECT 
    source_id,
    category,
    COUNT(*) AS advice_count,
    COUNT(DISTINCT user_id) AS user_count,
    AVG(relevance_score) AS avg_relevance_score,
    MAX(published_date) AS latest_published_date
FROM financial_advice
GROUP BY source_id, category;
