// app/page.tsx (example of using it)
"use client";
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import SignOutButton from '@/components/ui/signoutbutton';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';

export default function Home() {
  const [user, setUser] = useState<User | null>(null); // State for the user object

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8">Welcome to Aether!</h1>

      {user ? (
        <div className="text-center">
          <p className="text-lg">Signed in as {user.email}.</p>
          <Link href="/dashboard" className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors duration-200">
              Go to Dashboard
          </Link>
          <div className="mt-4">
            <SignOutButton />
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-lg mb-4">You are not signed in.</p>
          <Link href="/auth/signin" className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors duration-200">
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
}
