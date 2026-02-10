import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { DEMO_USER_ID } from "@/lib/constants";
import { memoryStore } from "@/lib/store-memory";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key) {
    try {
      const supabase = getSupabaseServer();
      const { data, error } = await supabase
        .from("expense_categories")
        .select("id, name")
        .eq("user_id", DEMO_USER_ID)
        .order("name");

      if (error) throw error;
      return NextResponse.json(data ?? []);
    } catch (e) {
      console.error("Categories API error:", e);
      return NextResponse.json(
        { error: "Failed to load categories" },
        { status: 500 }
      );
    }
  }

  const categories = memoryStore.getCategories();
  return NextResponse.json(categories);
}
