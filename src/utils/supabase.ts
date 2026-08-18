import { createClient } from "@supabase/supabase-js";

// Fallback dùng khi build không có biến môi trường (VD: Vercel build
// không cấu hình env). Anon key là public-safe — nó luôn xuất hiện
// trong client bundle dù có để ở .env hay không. Muốn đổi project
// Supabase thì ghi đè qua biến môi trường VITE_SUPABASE_*.
const FALLBACK_SUPABASE_URL = "https://sdexdrzbauytcaebmzhh.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZXhkcnpiYXV5dGNhZWJtemhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwMjA4MTAsImV4cCI6MjEwMjU5NjgxMH0.cIyKtcMWd6_y6fe5yfZgwUgEu0ECLFh7PkTBnAuyj5g";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    "⚠️ Supabase env vars chưa cấu hình — đang dùng fallback có sẵn trong code.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
