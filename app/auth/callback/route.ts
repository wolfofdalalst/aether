// app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import prisma from '@/lib/prisma';

// Create a server-side Supabase client for this route handler
// Do NOT expose anon key or service role key directly in a route handler unless absolutely necessary
// For auth callbacks, it's generally fine as the Supabase JS SDK handles session exchange
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required environment variables for callback!");
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  console.debug('[Auth Callback] Received code:', code);

  if (code) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Required for PKCE flow in server components/route handlers
        // This makes sure the session token is properly exchanged
        flowType: 'pkce',
        storageKey: 'sb', // Default, ensure consistent with client
      }
    });
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    console.debug('[Auth Callback] exchangeCodeForSession response:', data, error);

    if (!error) {
      // Ensure a profile exists for this user (OAuth sign-up)
      try {
        const user = data.session.user;
        const existing = await prisma.profile.findUnique({ where: { user_id: user.id } });
        if (!existing) {
          // Derive a username from metadata or email
          const meta = user.user_metadata as { full_name?: string; name?: string };
          const base = meta.full_name ?? meta.name ?? user.email?.split('@')[0] ?? user.id;
          const username = String(base).toLowerCase().replace(/\s+/g, '_');
          await prisma.profile.create({ data: { user_id: user.id, username } });
        }
      } catch (e) {
        console.error('[Auth Callback] Error creating OAuth profile:', e);
      }
      // Redirect to dashboard after login
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/signin?error=auth_error`);
}