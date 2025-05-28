import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/utils/supabase-server';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { user_id: session.user.id },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ transactions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
