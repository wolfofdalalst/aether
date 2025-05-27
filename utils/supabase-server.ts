// utils/supabase-server.ts
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Make this function async because we need to await cookies() inside it
export async function createSupabaseServerClient() {
  console.debug('[Supabase Server] Initializing server client');
  // Await cookies() before accessing
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Only getAll is required for SSR flows in App Router
      cookies: {
        getAll: () => {
          const entries = cookieStore.getAll().map(c => ({ name: c.name, value: c.value }));
          console.debug('[Supabase Server] getAll cookies:', entries);
          return entries;
        }
      }
    }
  );
}

// Added debug logs below createSupabaseServerClient
export async function getSession() {
  console.debug('[Supabase Server] getSession called');
  const supabase = await createSupabaseServerClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  console.debug('[Supabase Server] getSession result:', session, error);
  return session;
}

export async function getUser() {
  console.debug('[Supabase Server] getUser called');
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  console.debug('[Supabase Server] getUser result:', user, error);
  return user;
}