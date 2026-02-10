"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ExpenseFilters } from "../components/ExpenseFilters";

interface Category {
  id: string;
  name: string;
}

interface ExpenseRecord {
  id: string;
  amount: number;
  currency: string;
  description: string;
  expense_date: string;
  created_at: string;
  category_id?: string;
  category_name: string;
}

function RecordsContent() {
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const queryString = searchParams.toString();

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/expenses${queryString ? `?${queryString}` : ""}`)
      .then((r) => r.json())
      .then((data) => setExpenses(Array.isArray(data) ? data : []))
      .catch(() => setExpenses([]))
      .finally(() => setLoading(false));
  }, [queryString]);

  return (
    <>
      <div className="page-header">
        <h1>Records</h1>
        <p>All payments. Filter by category, date range, or amount.</p>
      </div>
      <ExpenseFilters categories={categories} />
      <div className="card">
        {loading ? (
          <p className="empty-state">Loading…</p>
        ) : expenses.length === 0 ? (
          <p className="empty-state">No records match your filters.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((row) => (
                  <tr key={row.id}>
                    <td>{row.expense_date}</td>
                    <td>{row.category_name}</td>
                    <td>{row.description}</td>
                    <td style={{ textAlign: "right" }} className="amount">
                      {row.currency} {Number(row.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default function RecordsPage() {
  return (
    <Suspense fallback={<p className="empty-state">Loading…</p>}>
      <RecordsContent />
    </Suspense>
  );
}
