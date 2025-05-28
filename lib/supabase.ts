import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required environment variables!");
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Debug: Log client initialization
console.log('[supabase] Client initialized with URL:', supabaseUrl);

// Debug: Log auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.debug('[supabase] Auth state changed:', event, session ? 'Session exists' : 'No session');
});