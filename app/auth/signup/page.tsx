// app/auth/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { Form, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

export default function SignUpPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  interface SignUpFormValues { username: string; email: string; password: string }
  const form = useForm<SignUpFormValues>({ defaultValues: { username: '', email: '', password: '' } });
  const onSubmit = form.handleSubmit(async (values) => {
    setError('');
    setSuccess('');
    setLoading(true);

    console.debug('[SignUp] Sign-up attempt for:', values.email);

    // 1. Sign up with Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        // You can send additional user metadata if needed (e.g., for RLS)
        // data: { username: values.username }
      }
    });
    console.debug('[SignUp] signUp response:', data, authError);

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // 2. If user created successfully in Supabase Auth, create a corresponding Profile in your public schema
      try {
        console.debug('[SignUp] Creating profile for user:', data.user.id);
        const response = await fetch('/api/create-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.user.id, username: values.username, email: values.email }),
        });

        console.debug('[SignUp] Profile creation response status:', response.status);
        const profileData = await response.json();
        console.debug('[SignUp] Profile creation data:', profileData);

        if (!response.ok) {
          // If profile creation fails, you might want to log this or handle it
          // Potentially even delete the Supabase auth user (though less common)
          setError(profileData.message || 'Error creating user profile.');
          // console.error("Profile creation error:", profileData.message);
          setLoading(false);
          return;
        }

        setSuccess('Registration successful! Please check your email for verification (if enabled) and then sign in.');
        // Supabase sign-up doesn't auto-login by default, redirects to sign-in
        router.push('/auth/signin');
      } catch (profileError) {
        console.error('[SignUp] Client-side profile creation error:', profileError);
        setError("An unexpected error occurred during profile setup.");
      }
    }
    setLoading(false);
  });

  const handleOAuthSignUp = async (provider: 'github' | 'google') => {
    setError(''); setLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
    console.debug('[SignUp] OAuth signUp response:', data, error);
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold mb-6 text-center">Create your Aether account</h1>
        {error && <p className="text-red-600 mb-4 text-sm text-center">{error}</p>}
        {success && <p className="text-green-600 mb-4 text-sm text-center">{success}</p>}
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FormItem>
              <FormLabel htmlFor="username">Username</FormLabel>
              <FormControl>
                <Input
                  id="username"
                  type="text"
                  disabled={loading}
                  {...form.register('username', { required: 'Username is required' })}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel htmlFor="email">Email</FormLabel>
              <FormControl>
                <Input
                  id="email"
                  type="email"
                  disabled={loading}
                  {...form.register('email', { required: 'Email is required' })}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormItem>
              <FormLabel htmlFor="password">Password</FormLabel>
              <FormControl>
                <Input
                  id="password"
                  type="password"
                  disabled={loading}
                  {...form.register('password', { required: 'Password is required' })}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing Up...' : 'Sign Up'}
            </Button>
          </form>
        </Form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-3">Or sign up with</p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => handleOAuthSignUp('github')} disabled={loading}>
              <FaGithub className="mr-2" /> GitHub
            </Button>
            <Button variant="outline" onClick={() => handleOAuthSignUp('google')} disabled={loading}>
              <FaGoogle className="mr-2" /> Google
            </Button>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}