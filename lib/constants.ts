/**
 * Demo user ID used when Supabase is configured.
 * Set DEMO_USER_ID in .env to match the user created by seed-demo.sql.
 */
export const DEMO_USER_ID = process.env.DEMO_USER_ID ?? "00000000-0000-0000-0000-000000000001";

/** Popular expense categories (used when DB has no categories or for fallback). */
export const DEFAULT_CATEGORY_NAMES = [
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
];

/** Amount range options for filters. */
export const AMOUNT_RANGES = [
  { id: "0-500", label: "$0 – $500", min: 0, max: 500 },
  { id: "501-3000", label: "$501 – $3,000", min: 501, max: 3000 },
  { id: "3000+", label: "$3,000+", min: 3001, max: null as number | null },
] as const;
