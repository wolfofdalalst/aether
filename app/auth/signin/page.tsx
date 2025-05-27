"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; // Import your Supabase client
import { Button } from '@/components/ui/button';
import { Form, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { FaGithub, FaGoogle } from 'react-icons/fa';

export default function SignInPage() {
  const form = useForm<{ email: string; password: string }>({ defaultValues: { email: '', password: '' } });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = form.handleSubmit(async ({ email, password }) => {
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError('Unexpected error');
    } finally {
      setLoading(false);
    }
  });

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setLoading(true);
    console.debug('[SignIn] OAuth sign-in attempt with provider:', provider);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`, // Supabase callback URL
      },
    });
    console.debug('[SignIn] signInWithOAuth response:', data, error);
    
    if (error) {
      setError(error.message);
      console.error("OAuth sign in error:", error.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold mb-6 text-center">Sign In to Aether</h1>
        {error && <p className="text-destructive text-center mb-4">{error}</p>}
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
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
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </Form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">Or continue with</p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => handleOAuthSignIn('github')} disabled={loading}>
              <FaGithub className="mr-2" /> GitHub
            </Button>
            <Button variant="outline" onClick={() => handleOAuthSignIn('google')} disabled={loading}>
              <FaGoogle className="mr-2" /> Google
            </Button>
          </div>
        </div>
        <p className="mt-6 text-sm text-center text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}