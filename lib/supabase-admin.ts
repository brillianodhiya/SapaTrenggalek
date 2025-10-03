import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client with service role key
// Only use this on the server side (API routes, server actions)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// This client bypasses Row Level Security (RLS)
// Use with caution and only for admin operations
