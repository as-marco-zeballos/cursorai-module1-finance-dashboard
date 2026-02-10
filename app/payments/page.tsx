"use client";

import { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
}

export default function PaymentsPage() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0 && !categoryId) {
          setCategoryId(data[0].id);
        }
      })
      .catch(() => setCategories([]));
  }, [categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const num = parseFloat(amount);
    if (Number.isNaN(num) || num <= 0) {
      setMessage({ type: "err", text: "Enter a valid positive amount." });
      return;
    }
    if (!categoryId) {
      setMessage({ type: "err", text: "Select a category." });
      return;
    }
    const expenseDate = new Date().toISOString().slice(0, 10);
    setLoading(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: num,
          description: description.trim() || "—",
          category_id: categoryId,
          expense_date: expenseDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error || "Failed to save." });
        return;
      }
      setMessage({ type: "ok", text: "Payment recorded." });
      setAmount("");
      setDescription("");
    } catch {
      setMessage({ type: "err", text: "Network error." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-header">
      <h1>Payments</h1>
      <p>Record a daily payment.</p>

      <div className="card" style={{ maxWidth: "28rem", marginTop: "1rem" }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="What was this expense for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.length === 0 && (
                <option value="">Loading…</option>
              )}
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {message && (
            <p
              style={{
                marginBottom: "0.75rem",
                color: message.type === "ok" ? "var(--positive)" : "var(--negative)",
              }}
            >
              {message.text}
            </p>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving…" : "Record payment"}
          </button>
        </form>
      </div>
    </div>
  );
}
