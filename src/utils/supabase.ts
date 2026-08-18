import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("🔍 Supabase config:", {
  url: supabaseUrl ? "✅ Set" : "❌ Missing",
  key: supabaseKey ? "✅ Set" : "❌ Missing",
});

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "❌ Missing Supabase env vars:",
    { supabaseUrl, supabaseKey }
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseKey || "placeholder-key"
);
