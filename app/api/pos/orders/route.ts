import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/lib/models/Order';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const channel = searchParams.get('channel');
    const status = searchParams.get('status');

    const query: any = {};
    if (channel && channel !== 'all') {
      query.channel = channel;
    }
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'username email');

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('POS GET all orders error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
