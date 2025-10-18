import { createClient } from '@supabase/supabase-js'

/**
 * Create a Supabase client with service role key
 * This bypasses Row Level Security (RLS) and should only be used in secure server contexts
 *
 * USE CASES:
 * - Admin operations that need to bypass RLS
 * - Bot operations (like content generation)
 * - System-level operations
 *
 * NEVER expose this client to the frontend!
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase URL or Service Role Key')
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
