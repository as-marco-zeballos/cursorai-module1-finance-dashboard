/**
 * TypeScript types matching the database schema
 * Generated for Personal Finance Control system
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export interface User {
  id: string; // UUID
  email: string;
  username: string;
  password_hash: string;
  full_name?: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
  preferences: Record<string, any>; // JSONB
}

export interface ExpenseCategory {
  id: string; // UUID
  user_id: string;
  name: string;
  description?: string;
  parent_category_id?: string;
  icon?: string;
  color?: string; // Hex color
  is_system: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PaymentMethod {
  id: string; // UUID
  user_id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'cash' | 'digital_wallet' | 'bank_transfer';
  account_number_last4?: string;
  bank_name?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Expense {
  id: string; // UUID
  user_id: string;
  category_id?: string;
  payment_method_id?: string;
  amount: number; // DECIMAL(15, 2)
  currency: string; // ISO 4217 code
  description?: string;
  expense_date: Date; // DATE
  receipt_url?: string;
  location?: string;
  tags?: string[];
  notes?: string;
  is_recurring: boolean;
  recurring_pattern?: RecurringPattern; // JSONB
  created_at: Date;
  updated_at: Date;
  metadata?: Record<string, any>; // JSONB
}

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  day?: number; // Day of month (1-31) or day of week (0-6)
  interval?: number; // Every N days/weeks/months
  end_date?: string; // ISO date string
}

export interface AdviceSource {
  id: string; // UUID
  name: string;
  url: string;
  source_type: 'website' | 'api' | 'rss_feed' | 'newsletter';
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface FinancialAdvice {
  id: string; // UUID
  source_id: string;
  user_id?: string; // NULL = public
  title: string;
  content: string;
  excerpt?: string;
  url: string;
  author?: string;
  published_date?: Date;
  fetched_date: Date;
  category?: AdviceCategory;
  tags?: string[];
  relevance_score?: number; // 0-1
  is_read: boolean;
  is_bookmarked: boolean;
  is_archived: boolean;
  metadata?: Record<string, any>; // JSONB
  created_at: Date;
  updated_at: Date;
}

export type AdviceCategory = 
  | 'budgeting' 
  | 'investing' 
  | 'saving' 
  | 'debt' 
  | 'retirement' 
  | 'taxes' 
  | 'insurance' 
  | 'real_estate' 
  | 'education'
  | 'general';

export interface AdviceInteraction {
  id: string; // UUID
  user_id: string;
  advice_id: string;
  interaction_type: 'read' | 'bookmark' | 'share' | 'like' | 'dismiss';
  notes?: string;
  created_at: Date;
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

export interface Budget {
  id: string; // UUID
  user_id: string;
  category_id?: string;
  name: string;
  amount: number; // DECIMAL(15, 2)
  currency: string;
  period_type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: Date;
  end_date?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface FinancialGoal {
  id: string; // UUID
  user_id: string;
  title: string;
  description?: string;
  target_amount: number; // DECIMAL(15, 2)
  current_amount: number; // DECIMAL(15, 2)
  currency: string;
  target_date?: Date;
  goal_type: 'savings' | 'debt_payoff' | 'investment' | 'purchase';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

export interface Account {
  id: string; // UUID
  user_id: string;
  name: string;
  account_type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'cash';
  balance: number; // DECIMAL(15, 2)
  currency: string;
  bank_name?: string;
  account_number_last4?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AccountTransaction {
  id: string; // UUID
  account_id: string;
  expense_id?: string;
  transaction_type: 'debit' | 'credit' | 'transfer';
  amount: number; // DECIMAL(15, 2)
  description?: string;
  transaction_date: Date;
  balance_after?: number; // DECIMAL(15, 2)
  created_at: Date;
}

// ============================================================================
// VIEW TYPES
// ============================================================================

export interface MonthlyExpenseSummary {
  user_id: string;
  month: Date;
  category_id?: string;
  expense_count: number;
  total_amount: number;
  avg_amount: number;
  min_amount: number;
  max_amount: number;
}

export interface CategoryExpenseSummary {
  user_id: string;
  category_id: string;
  category_name: string;
  expense_count: number;
  total_amount: number;
  avg_amount: number;
  first_expense_date?: Date;
  last_expense_date?: Date;
}

export interface AdviceSummary {
  source_id: string;
  category?: string;
  advice_count: number;
  user_count: number;
  avg_relevance_score?: number;
  latest_published_date?: Date;
}

// ============================================================================
// DTOs (Data Transfer Objects) for API
// ============================================================================

export interface CreateExpenseDTO {
  category_id?: string;
  payment_method_id?: string;
  amount: number;
  currency?: string;
  description?: string;
  expense_date: string; // ISO date string
  receipt_url?: string;
  location?: string;
  tags?: string[];
  notes?: string;
  is_recurring?: boolean;
  recurring_pattern?: RecurringPattern;
  metadata?: Record<string, any>;
}

export interface UpdateExpenseDTO extends Partial<CreateExpenseDTO> {
  id: string;
}

export interface CreateFinancialAdviceDTO {
  source_id: string;
  title: string;
  content: string;
  excerpt?: string;
  url: string;
  author?: string;
  published_date?: string; // ISO date string
  category?: AdviceCategory;
  tags?: string[];
  relevance_score?: number;
  metadata?: Record<string, any>;
}

export interface ExpenseFilters {
  user_id: string;
  start_date?: string;
  end_date?: string;
  category_id?: string;
  payment_method_id?: string;
  min_amount?: number;
  max_amount?: number;
  tags?: string[];
  search?: string; // Search in description
  limit?: number;
  offset?: number;
}

export interface AdviceFilters {
  user_id?: string;
  source_id?: string;
  category?: AdviceCategory;
  tags?: string[];
  min_relevance_score?: number;
  is_read?: boolean;
  is_bookmarked?: boolean;
  is_archived?: boolean;
  search?: string; // Search in title/content
  limit?: number;
  offset?: number;
}
