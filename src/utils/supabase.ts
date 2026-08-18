import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Missing VITE_SUPABASE_URL in environment variables. Check your .env.local file."
  );
}

if (!supabaseKey) {
  throw new Error(
    "Missing VITE_SUPABASE_ANON_KEY in environment variables. Check your .env.local file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
