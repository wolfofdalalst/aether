// app/api/create-profile/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 

export async function POST(request: Request) {
  try {
    const { userId, username, email } = await request.json();

    if (!userId || !username || !email) {
      return NextResponse.json({ message: 'User ID, username, and email are required' }, { status: 400 });
    }

    // Check if the username is already taken
    const existingUsername = await prisma.profile.findUnique({ where: { username } });
    if (existingUsername) {
      return NextResponse.json({ message: 'Username already exists.' }, { status: 409 });
    }
    // Check if a profile already exists for this user_id
    const existingProfile = await prisma.profile.findUnique({
      where: { user_id: userId },
    });

    if (existingProfile) {
      return NextResponse.json({ message: 'Profile already exists for this user.' }, { status: 409 });
    }

    // Create the new profile in your public schema
    const newProfile = await prisma.profile.create({
      data: {
        user_id: userId,
        username: username,
        // You might want to initialize other fields here if needed
      },
    });

    return NextResponse.json({ message: 'Profile created successfully', profile: newProfile }, { status: 201 });
  } catch (error) {
    console.error('Error creating user profile:', error);
    // Handle unique constraint errors for username if desired
    return NextResponse.json({ message: 'Internal server error during profile creation.' }, { status: 500 });
  }
}