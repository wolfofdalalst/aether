"use client";

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import React from 'react';

const SignOutButton: React.FC = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      router.push('/auth/signin'); // Redirect to sign-in page after sign out
      router.refresh(); // Force a re-render of layout
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
    >
      Sign Out
    </button>
  );
};

export default SignOutButton;