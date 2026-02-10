"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface Category {
  id: string;
  name: string;
}

const AMOUNT_OPTIONS = [
  { value: "", label: "Any amount" },
  { value: "0-500", label: "$0 – $500" },
  { value: "501-3000", label: "$501 – $3,000" },
  { value: "3000+", label: "$3,000+" },
];

interface ExpenseFiltersProps {
  categories: Category[];
}

export function ExpenseFilters({ categories }: ExpenseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category_id = searchParams.get("category_id") ?? "";
  const start_date = searchParams.get("start_date") ?? "";
  const end_date = searchParams.get("end_date") ?? "";
  const amount_range = searchParams.get("amount_range") ?? "";

  const pathname = usePathname();

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="filters">
      <div className="form-group" style={{ minWidth: "140px" }}>
        <label htmlFor="filter-category">Category</label>
        <select
          id="filter-category"
          value={category_id}
          onChange={(e) => update("category_id", e.target.value)}
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group" style={{ minWidth: "140px" }}>
        <label htmlFor="filter-start">From date</label>
        <input
          id="filter-start"
          type="date"
          value={start_date}
          onChange={(e) => update("start_date", e.target.value)}
        />
      </div>
      <div className="form-group" style={{ minWidth: "140px" }}>
        <label htmlFor="filter-end">To date</label>
        <input
          id="filter-end"
          type="date"
          value={end_date}
          onChange={(e) => update("end_date", e.target.value)}
        />
      </div>
      <div className="form-group" style={{ minWidth: "140px" }}>
        <label htmlFor="filter-amount">Amount</label>
        <select
          id="filter-amount"
          value={amount_range}
          onChange={(e) => update("amount_range", e.target.value)}
        >
          {AMOUNT_OPTIONS.map((o) => (
            <option key={o.value || "any"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
