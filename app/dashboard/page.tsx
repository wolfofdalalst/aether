import { getUser } from '@/utils/supabase-server'; // Import your server-side Supabase helper
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma'; // Import Prisma to fetch profile data

export default async function DashboardPage() {
  const user = await getUser(); // Get the Supabase auth user

  if (!user) {
    redirect('/auth/signin'); // Redirect if not authenticated
  }

  // Fetch the user's profile from your public schema using Prisma
  // This links the Supabase auth user ID to your custom profile data
  const userProfile = await prisma.profile.findUnique({
    where: { user_id: user.id },
  });

  if (!userProfile) {
    // Handle case where auth user exists but profile doesn't (e.g., race condition, or user didn't complete signup flow)
    console.warn(`Auth user ${user.id} exists, but no profile found.`);
    // You might redirect to a profile completion page
    // For now, let's just show a generic message
    return (
      <div className="min-h-screen p-8">
        <h1 className="text-4xl font-bold mb-4">Welcome, {user.email}!</h1>
        <p className="text-lg text-gray-700">Your profile is being set up. Please complete it if necessary.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to your Aether Dashboard, {userProfile.username || user.email}!</h1>
      <p className="text-lg text-gray-700">This is your secure financial overview.</p>
      {/* Add your finance tracking components here */}
      <p className="mt-4">Your Auth User ID: {user.id}</p>
      <p>Your Profile ID: {userProfile.id}</p>
    </div>
  );
}