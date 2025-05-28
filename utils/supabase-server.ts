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
      cookies: {
        getAll: () => {
          const entries = cookieStore.getAll().map(c => ({ name: c.name, value: c.value }));
          console.debug('[Supabase Server] getAll cookies:', entries);
          return entries;
        },
        setAll: (cookies) => {
          try {
            cookies.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        }
      }
    }
  );
}

// Added debug logs below createSupabaseServerClient
export async function getSession() {
  console.debug('[Supabase Server] getSession called');
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    console.debug('[Supabase Server] getSession result:', session ? 'Session found' : 'No session', error);
    if (error) {
      console.error('[Supabase Server] getSession error:', error);
      return null;
    }
    return session;
  } catch (err) {
    console.error('[Supabase Server] getSession exception:', err);
    return null;
  }
}

export async function getUser() {
  console.debug('[Supabase Server] getUser called');
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    console.debug('[Supabase Server] getUser result:', user ? 'User found' : 'No user', error);
    if (error) {
      console.error('[Supabase Server] getUser error:', error);
      return null;
    }
    return user;
  } catch (err) {
    console.error('[Supabase Server] getUser exception:', err);
    return null;
  }
}