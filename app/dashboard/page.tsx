"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageLoader, InlineLoader } from '@/components/ui/loading-spinner';
import { TransactionSkeleton } from '@/components/ui/skeleton';
import { Navbar, UserMenu } from '@/components/ui/navbar';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category?: string | null;
  date: string;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [formValues, setFormValues] = useState({ amount: '', description: '', category: '' });
  const [txLoading, setTxLoading] = useState(false);
  const router = useRouter();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', active: true },
    { href: '/analytics', label: 'Analytics', active: false },
    { href: '/settings', label: 'Settings', active: false },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/signin');
  };

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

  // fetch transactions after profile loads
  useEffect(() => {
    async function fetchTransactions() {
      if (!profile) return;
      
      setTransactionsLoading(true);
      try {
        const res = await fetch('/api/get-transactions');
        if (res.ok) {
          const { transactions } = await res.json();
          setTransactions(transactions);
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        setTransactionsLoading(false);
      }
    }
    fetchTransactions();
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Validate form data before submitting
    const amount = parseFloat(formValues.amount);
    if (!formValues.amount || isNaN(amount)) {
      console.error('Invalid amount provided');
      alert('Please enter a valid amount');
      return;
    }
    
    if (!formValues.description.trim()) {
      console.error('Description is required');
      alert('Please enter a description');
      return;
    }
    
    setTxLoading(true);
    try {
      const res = await fetch('/api/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount, // Send the parsed number instead of string
          description: formValues.description.trim(),
          category: formValues.category.trim() || undefined,
        }),
      });
      
      if (res.ok) {
        const { transaction } = await res.json();
        setTransactions(prev => [transaction, ...prev]);
        setFormValues({ amount: '', description: '', category: '' });
      } else {
        const errorData = await res.json();
        console.error('Failed to add transaction:', errorData);
        alert(`Failed to add transaction: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error creating transaction:', err);
      alert('An unexpected error occurred while creating the transaction');
    } finally {
      setTxLoading(false);
    }
  }

  if (loading) return <PageLoader />;
  if (!profile) return <div>Error loading profile.</div>;

  return (
    <>
      <Navbar 
        brand="Aether" 
        items={navItems}
      >
        <UserMenu username={profile.username} onSignOut={handleSignOut} />
      </Navbar>
      
      <div className="container mx-auto p-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Welcome back, {profile.username}!
            </h1>
            <p className="text-lg text-muted-foreground">
              Here&apos;s your financial overview and transaction management.
            </p>
          </div>

          {/* Add Transaction Section */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-2xl font-semibold mb-4">Add Transaction</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
              <Input
                type="number"
                step="0.01"
                placeholder="Amount (e.g., 100.50)"
                value={formValues.amount}
                onChange={e => setFormValues(v => ({ ...v, amount: e.target.value }))}
                disabled={txLoading}
                required
              />
              <Input
                type="text"
                placeholder="Description"
                value={formValues.description}
                onChange={e => setFormValues(v => ({ ...v, description: e.target.value }))}
                disabled={txLoading}
                required
              />
              <Input
                type="text"
                placeholder="Category (optional)"
                value={formValues.category}
                onChange={e => setFormValues(v => ({ ...v, category: e.target.value }))}
                disabled={txLoading}
              />
              <Button type="submit" disabled={txLoading} className="w-fit">
                {txLoading ? <InlineLoader text="Adding..." /> : 'Add Transaction'}
              </Button>
            </form>
          </div>

          {/* Transactions Section */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-2xl font-semibold mb-4">Recent Transactions</h2>
            
            {transactionsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <TransactionSkeleton key={i} />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No transactions yet. Add your first transaction above!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border bg-background hover:bg-accent/50 transition-colors cursor-pointer">
                    <div className="space-y-1">
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(tx.date).toLocaleString()}
                      </p>
                      {tx.category && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-xs font-medium">
                          {tx.category}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-semibold font-mono">₹{tx.amount.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}