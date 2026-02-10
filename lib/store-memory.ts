/**
 * In-memory store for development when Supabase is not configured.
 * Data is lost on server restart.
 */

export interface MemoryCategory {
  id: string;
  name: string;
}

export interface MemoryExpense {
  id: string;
  amount: number;
  currency: string;
  description: string;
  category_id: string;
  category_name: string;
  expense_date: string;
  created_at: string;
}

const categories: MemoryCategory[] = [
  "Food & Dining",
  "Groceries",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Health",
  "Personal Care",
  "Subscriptions",
  "Travel",
  "Education",
  "Other",
].map((name, i) => ({ id: `cat-${i}`, name }));

const expenses: MemoryExpense[] = [];

function nextId(): string {
  return `exp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const memoryStore = {
  getCategories(): MemoryCategory[] {
    return [...categories];
  },

  getCategoryById(id: string): MemoryCategory | undefined {
    return categories.find((c) => c.id === id);
  },

  getExpenses(filters: {
    category_id?: string;
    start_date?: string;
    end_date?: string;
    min_amount?: number;
    max_amount?: number;
  }): MemoryExpense[] {
    let list = [...expenses];
    if (filters.category_id) {
      list = list.filter((e) => e.category_id === filters.category_id);
    }
    if (filters.start_date) {
      list = list.filter((e) => e.expense_date >= filters.start_date!);
    }
    if (filters.end_date) {
      list = list.filter((e) => e.expense_date <= filters.end_date!);
    }
    if (filters.min_amount != null) {
      list = list.filter((e) => e.amount >= filters.min_amount!);
    }
    if (filters.max_amount != null) {
      list = list.filter((e) => e.amount <= filters.max_amount!);
    }
    list.sort((a, b) => (b.created_at > a.created_at ? 1 : -1));
    return list;
  },

  addExpense(data: {
    amount: number;
    description: string;
    category_id: string;
    expense_date: string;
  }): MemoryExpense {
    const cat = categories.find((c) => c.id === data.category_id);
    const record: MemoryExpense = {
      id: nextId(),
      amount: data.amount,
      currency: "USD",
      description: data.description,
      category_id: data.category_id,
      category_name: cat?.name ?? "Other",
      expense_date: data.expense_date,
      created_at: new Date().toISOString(),
    };
    expenses.push(record);
    return record;
  },
};
