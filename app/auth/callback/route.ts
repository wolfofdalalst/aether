// app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
  // const next = searchParams.get('next') ?? '/dashboard'; // Optional: for custom redirects

  if (code) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Required for PKCE flow in server components/route handlers
        // This makes sure the session token is properly exchanged
        flowType: 'pkce',
        storageKey: 'sb', // Default, ensure consistent with client
      }
    });
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Redirect to dashboard or wherever you want after successful login
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/signin?error=auth_error`);
}