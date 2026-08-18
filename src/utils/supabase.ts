import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "❌ Missing Supabase env vars (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) in .env.local.",
    { supabaseUrl: supabaseUrl || "(missing)", supabaseKey: supabaseKey ? "✅ Set" : "(missing)" },
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseKey || "placeholder-key"
);
