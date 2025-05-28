import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/utils/supabase-server';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const { amount, description, category } = await request.json();
    
    // Validate required fields
    if (amount === undefined || amount === null || amount === '') {
      return NextResponse.json({ message: 'Amount is required' }, { status: 400 });
    }
    
    if (!description || description.trim() === '') {
      return NextResponse.json({ message: 'Description is required' }, { status: 400 });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      return NextResponse.json({ message: 'Amount must be a valid number' }, { status: 400 });
    }
    
    const newTransaction = await prisma.transaction.create({
      data: {
        user_id: session.user.id,
        amount: parsedAmount,
        description: description.trim(),
        category: category?.trim() || null,
      },
    });

    return NextResponse.json({ transaction: newTransaction }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
