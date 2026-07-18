import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import InventoryLocation from '@/lib/models/InventoryLocation';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const locations = await InventoryLocation.find({ isActive: true });
    return NextResponse.json(locations);
  } catch (error: any) {
    console.error('POS Locations GET error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
