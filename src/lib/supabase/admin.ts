import { createClient } from "@supabase/supabase-js";

/**
 * Creates an admin Supabase client using the SERVICE_ROLE_KEY.
 * WARNING: NEVER use this in client components or expose to public users.
 * Bypasses Row Level Security (RLS) for backend operations like webhooks.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock.supabase.co";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "mock-service-role-key";

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
