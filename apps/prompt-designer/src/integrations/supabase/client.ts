import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

const FALLBACK_URL = "https://placeholder.supabase.co";
const FALLBACK_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.signature";

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY,
);

export const assertSupabaseConfigured = (feature = "esta funcionalidad") => {
  if (!isSupabaseConfigured) {
    throw new Error(
      `Supabase no esta configurado para ${feature}. Define VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY.`,
    );
  }
};

export const supabase = createClient<Database>(
  isSupabaseConfigured ? SUPABASE_URL : FALLBACK_URL,
  isSupabaseConfigured ? SUPABASE_PUBLISHABLE_KEY : FALLBACK_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);
