import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Reads the two public Supabase keys from the environment. If they aren't set
// yet, `supabase` is null and the app runs normally with auth disabled — so
// the build never breaks before the project is configured.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;
