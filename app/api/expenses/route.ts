import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { DEMO_USER_ID } from "@/lib/constants";
import { memoryStore } from "@/lib/store-memory";

function parseAmountRange(range: string | null): { min?: number; max?: number } {
  if (!range) return {};
  if (range === "0-500") return { min: 0, max: 500 };
  if (range === "501-3000") return { min: 501, max: 3000 };
  if (range === "3000+") return { min: 3001 };
  return {};
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category_id = searchParams.get("category_id") ?? undefined;
  const start_date = searchParams.get("start_date") ?? undefined;
  const end_date = searchParams.get("end_date") ?? undefined;
  const amount_range = searchParams.get("amount_range");
  const { min: min_amount, max: max_amount } = parseAmountRange(amount_range);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key) {
    try {
      const supabase = getSupabaseServer();
      let query = supabase
        .from("expenses")
        .select(
          `
          id,
          amount,
          currency,
          description,
          expense_date,
          created_at,
          expense_categories ( id, name )
        `
        )
        .eq("user_id", DEMO_USER_ID)
        .order("created_at", { ascending: false });

      if (category_id) query = query.eq("category_id", category_id);
      if (start_date) query = query.gte("expense_date", start_date);
      if (end_date) query = query.lte("expense_date", end_date);
      if (min_amount != null) query = query.gte("amount", min_amount);
      if (max_amount != null) query = query.lte("amount", max_amount);

      const { data, error } = await query;
      if (error) throw error;

      const rows = (data ?? []).map((row: Record<string, unknown>) => {
        const cat = row.expense_categories as { id: string; name: string } | null;
        return {
          id: row.id,
          amount: row.amount,
          currency: row.currency,
          description: row.description,
          expense_date: row.expense_date,
          created_at: row.created_at,
          category_id: cat?.id,
          category_name: cat?.name ?? "Other",
        };
      });
      return NextResponse.json(rows);
    } catch (e) {
      console.error("Expenses GET error:", e);
      return NextResponse.json(
        { error: "Failed to load expenses" },
        { status: 500 }
      );
    }
  }

  const list = memoryStore.getExpenses({
    category_id,
    start_date,
    end_date,
    min_amount: min_amount ?? undefined,
    max_amount: max_amount ?? undefined,
  });
  return NextResponse.json(list);
}

export async function POST(request: NextRequest) {
  let body: { amount: number; description: string; category_id: string; expense_date: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { amount, description, category_id, expense_date } = body;
  if (
    typeof amount !== "number" ||
    amount <= 0 ||
    !category_id ||
    !expense_date
  ) {
    return NextResponse.json(
      { error: "Missing or invalid: amount (positive number), category_id, expense_date" },
      { status: 400 }
    );
  }
  const desc = typeof description === "string" ? description.trim() : "";

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key) {
    try {
      const supabase = getSupabaseServer();
      const { data, error } = await supabase
        .from("expenses")
        .insert({
          user_id: DEMO_USER_ID,
          category_id: category_id || null,
          amount,
          currency: "USD",
          description: desc || "—",
          expense_date,
        })
        .select(
          `
          id,
          amount,
          currency,
          description,
          expense_date,
          created_at,
          expense_categories ( id, name )
        `
        )
        .single();

      if (error) throw error;
      const row = data as Record<string, unknown>;
      const cat = row.expense_categories as { id: string; name: string } | null;
      return NextResponse.json({
        id: row.id,
        amount: row.amount,
        currency: row.currency,
        description: row.description,
        expense_date: row.expense_date,
        created_at: row.created_at,
        category_id: cat?.id,
        category_name: cat?.name ?? "Other",
      });
    } catch (e) {
      console.error("Expenses POST error:", e);
      return NextResponse.json(
        { error: "Failed to create expense" },
        { status: 500 }
      );
    }
  }

  const record = memoryStore.addExpense({
    amount,
    description: desc || "—",
    category_id,
    expense_date,
  });
  return NextResponse.json(record);
}
