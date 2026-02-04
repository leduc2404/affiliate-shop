import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a mock client for build time when env vars are not available
let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Create a mock client that returns empty data
  // This allows the build to succeed without Supabase configuration
  supabase = {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      }),
    }),
  } as unknown as SupabaseClient;
}

export { supabase };
