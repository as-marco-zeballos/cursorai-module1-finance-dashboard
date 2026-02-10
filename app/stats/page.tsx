"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
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

const CHART_COLORS = [
  "#38bdf8",
  "#4ade80",
  "#fbbf24",
  "#a78bfa",
  "#f87171",
  "#2dd4bf",
  "#fb923c",
  "#c084fc",
];

function StatsContent() {
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

  // Aggregate by category for bar chart (same data as Records, same filters)
  const chartData = expenses.reduce<{ name: string; total: number; count: number }[]>(
    (acc, row) => {
      const name = row.category_name || "Other";
      const existing = acc.find((c) => c.name === name);
      const amount = Number(row.amount);
      if (existing) {
        existing.total += amount;
        existing.count += 1;
      } else {
        acc.push({ name, total: amount, count: 1 });
      }
      return acc;
    },
    []
  );

  chartData.sort((a, b) => b.total - a.total);

  return (
    <>
      <div className="page-header">
        <h1>Stats</h1>
        <p>Expenses by category. Use the same filters as Records.</p>
      </div>
      <ExpenseFilters categories={categories} />
      <div className="chart-wrap">
        {loading ? (
          <p className="empty-state">Loading…</p>
        ) : chartData.length === 0 ? (
          <p className="empty-state">No data for the selected filters.</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={chartData}
              margin={{ top: 12, right: 12, left: 0, bottom: 12 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                tickLine={{ stroke: "var(--border)" }}
                axisLine={{ stroke: "var(--border)" }}
              />
              <YAxis
                tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                tickLine={{ stroke: "var(--border)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  color: "var(--text-primary)",
                }}
                labelStyle={{ color: "var(--text-secondary)" }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Total"]}
                labelFormatter={(label) => `Category: ${label}`}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}

export default function StatsPage() {
  return (
    <Suspense fallback={<p className="empty-state">Loading…</p>}>
      <StatsContent />
    </Suspense>
  );
}
