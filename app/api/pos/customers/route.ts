import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch registered users (excluding password hashes)
    const customers = await User.find({}).select('username email _id');
    return NextResponse.json(customers);
  } catch (error: any) {
    console.error('POS Customers GET error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
