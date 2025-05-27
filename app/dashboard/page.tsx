"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.debug('[Dashboard] session data:', session, 'sessionError:', sessionError);
        if (sessionError || !session) {
          console.error('No session or session error, redirecting:', sessionError);
          router.replace('/auth/signin');
          return;
        }
        // Query the Prisma-created table "Profile" (quoted) via Supabase REST
        const { data, error } = await supabase
          .from('Profile')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        console.debug('[Dashboard] fetched profile data:', data, error);
        if (error || !data) {
          console.error('Error fetching profile, redirecting:', error);
          router.replace('/auth/signin');
        } else {
          setProfile(data as Profile);
        }
      } catch (err) {
        console.error('[Dashboard] loadProfile error:', err);
        router.replace('/auth/signin');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [router]);

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>Error loading profile.</div>;

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome, {profile.username}!</h1>
      <p className="text-lg text-gray-700">This is your secure financial overview.</p>
    </div>
  );
}