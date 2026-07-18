import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import RegisterSession from '@/lib/models/RegisterSession';
import InventoryLocation from '@/lib/models/InventoryLocation';
import Order from '@/lib/models/Order';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Find if cashier has an open session
    const openSession = await RegisterSession.findOne({
      cashierId: decoded.id,
      status: 'Open'
    }).populate('locationId');

    if (!openSession) {
      // Find all active retail store locations to let them choose
      const locations = await InventoryLocation.find({ type: 'RetailStore', isActive: true });
      return NextResponse.json({ activeSession: null, locations });
    }

    return NextResponse.json({ activeSession: openSession });
  } catch (error: any) {
    console.error('POS Session GET error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { locationId, openingFloat } = await req.json();
    if (!locationId || openingFloat === undefined) {
      return NextResponse.json({ message: 'Please provide locationId and openingFloat' }, { status: 400 });
    }

    // Check if cashier already has an open session
    const existingSession = await RegisterSession.findOne({
      cashierId: decoded.id,
      status: 'Open'
    });
    if (existingSession) {
      return NextResponse.json({ message: 'You already have an open register session' }, { status: 400 });
    }

    const session = new RegisterSession({
      cashierId: decoded.id,
      locationId,
      openingFloat: Number(openingFloat),
      status: 'Open'
    });

    await session.save();
    const populatedSession = await RegisterSession.findById(session._id).populate('locationId');
    return NextResponse.json(populatedSession, { status: 201 });
  } catch (error: any) {
    console.error('POS Session POST error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, closingFloat, actualCashInDrawer } = await req.json();
    if (!sessionId || closingFloat === undefined || actualCashInDrawer === undefined) {
      return NextResponse.json({ message: 'Please provide sessionId, closingFloat, and actualCashInDrawer' }, { status: 400 });
    }

    const session = await RegisterSession.findById(sessionId);
    if (!session) {
      return NextResponse.json({ message: 'Register session not found' }, { status: 404 });
    }

    if (session.status === 'Closed') {
      return NextResponse.json({ message: 'Session already closed' }, { status: 400 });
    }

    // Fetch all orders matching this register session to reconcile sales
    const orders = await Order.find({ registerSessionId: sessionId });
    
    let cashTotal = 0;
    let cardTotal = 0;

    orders.forEach((order) => {
      if (order.paymentMethod === 'Cash') {
        cashTotal += order.totalAmount;
      } else if (order.paymentMethod === 'Card') {
        cardTotal += order.totalAmount;
      } else if (order.paymentMethod === 'Split') {
        cashTotal += order.amountPaidCash || 0;
        cardTotal += order.amountPaidCard || 0;
      }
    });

    session.salesCashTotal = Math.round(cashTotal * 100) / 100;
    session.salesCardTotal = Math.round(cardTotal * 100) / 100;
    session.closingFloat = Number(closingFloat);
    session.actualCashInDrawer = Number(actualCashInDrawer);
    session.status = 'Closed';
    session.closedAt = new Date();

    await session.save();
    return NextResponse.json(session);
  } catch (error: any) {
    console.error('POS Session PUT error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
