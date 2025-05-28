"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
  const [formValues, setFormValues] = useState({ amount: '', description: '', category: '' });
  const [txLoading, setTxLoading] = useState(false);
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

  // fetch transactions after profile loads
  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await fetch('/api/get-transactions');
        if (res.ok) {
          const { transactions } = await res.json();
          setTransactions(transactions);
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
      }
    }
    if (profile) fetchTransactions();
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

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>Error loading profile.</div>;

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome, {profile.username}!</h1>
      <p className="text-lg text-gray-700">This is your secure financial overview.</p>

      <section className="mt-8">
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
            {txLoading ? 'Adding...' : 'Add Transaction'}
          </Button>
        </form>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Transactions</h2>
        <ul className="space-y-2">
          {transactions.map(tx => (
            <li key={tx.id} className="p-4 border rounded-lg flex justify-between">
              <div>
                <p className="font-medium">{tx.description}</p>
                <p className="text-sm text-gray-500">{new Date(tx.date).toLocaleString()}</p>
                {tx.category && <p className="text-sm italic">{tx.category}</p>}
              </div>
              <span className="font-semibold">₹{tx.amount.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </section>

    </div>
  );
}