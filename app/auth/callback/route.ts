// app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  console.debug('[Auth Callback] Received code:', code ? 'Code present' : 'No code');

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    console.debug('[Auth Callback] exchangeCodeForSession response:', data ? 'Success' : 'Failed', error);

    if (!error && data.session) {
      // Ensure a profile exists for this user (OAuth sign-up)
      try {
        const user = data.session.user;
        const existing = await prisma.profile.findUnique({ where: { user_id: user.id } });
        if (!existing) {
          // Derive a username from metadata or email
          const meta = user.user_metadata as { full_name?: string; name?: string };
          const base = meta.full_name ?? meta.name ?? user.email?.split('@')[0] ?? user.id;
          const username = String(base).toLowerCase().replace(/\s+/g, '_');
          await prisma.profile.create({ 
            data: { 
              user_id: user.id, 
              username
            } 
          });
          console.debug('[Auth Callback] Created profile for OAuth user:', username);
        }
      } catch (e) {
        console.error('[Auth Callback] Error creating OAuth profile:', e);
      }
      // Redirect to dashboard after login
      return NextResponse.redirect(`${origin}/dashboard`);
    } else {
      console.error('[Auth Callback] Failed to exchange code for session:', error);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/signin?error=callback_failed`);
}