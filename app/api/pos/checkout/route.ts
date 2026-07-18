import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import RegisterSession from '@/lib/models/RegisterSession';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const {
      items,
      paymentMethod,
      amountPaidCash,
      amountPaidCard,
      customerId,
      locationId,
      registerSessionId
    } = await req.json();

    if (!items || items.length === 0 || !paymentMethod || !locationId || !registerSessionId) {
      return NextResponse.json({ message: 'Missing required checkout fields' }, { status: 400 });
    }

    // Verify register session is open
    const session = await RegisterSession.findById(registerSessionId);
    if (!session || session.status !== 'Open') {
      return NextResponse.json({ message: 'Register session is closed or not found' }, { status: 400 });
    }

    let calculatedTotal = 0;
    const processedItems = [];
    const rollbackList = [];

    // PASS 1: Concurrency Safe Inventory Check & Decrement
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        // Rollback already updated items
        for (const rb of rollbackList) {
          await Product.updateOne(
            { _id: rb.productId, "stockAtLocations.locationId": locationId },
            { $inc: { "stockAtLocations.$.stock": rb.quantity } }
          );
        }
        return NextResponse.json({ message: `Product with ID ${item.product} not found` }, { status: 404 });
      }

      // Find stock at this specific location
      const locStock = product.stockAtLocations.find(
        (loc: any) => loc.locationId.toString() === locationId.toString()
      );

      if (!locStock || locStock.stock < item.quantity) {
        // Rollback already updated items
        for (const rb of rollbackList) {
          await Product.updateOne(
            { _id: rb.productId, "stockAtLocations.locationId": locationId },
            { $inc: { "stockAtLocations.$.stock": rb.quantity } }
          );
        }
        return NextResponse.json({
          message: `Insufficient stock for product: ${product.title}. Only ${locStock ? locStock.stock : 0} items left at this location.`
        }, { status: 400 });
      }

      // Atomically decrement stock at this location to prevent race conditions
      const updateResult = await Product.updateOne(
        {
          _id: product._id,
          "stockAtLocations.locationId": locationId,
          "stockAtLocations.stock": { $gte: item.quantity } // Double check stock constraint
        },
        {
          $inc: { "stockAtLocations.$.stock": -item.quantity }
        }
      );

      if (updateResult.modifiedCount === 0) {
        // Concurrency collision occurred (another transaction grabbed it first)
        // Rollback already updated items
        for (const rb of rollbackList) {
          await Product.updateOne(
            { _id: rb.productId, "stockAtLocations.locationId": locationId },
            { $inc: { "stockAtLocations.$.stock": rb.quantity } }
          );
        }
        return NextResponse.json({
          message: `Concurrency conflict occurred for product: ${product.title}. Please re-scan.`
        }, { status: 409 });
      }

      // Track for possible rollback in subsequent items
      rollbackList.push({ productId: product._id, quantity: item.quantity });

      processedItems.push({
        product: product._id,
        title: product.title,
        imageUrl: product.imageUrl,
        quantity: item.quantity,
        price: product.price
      });

      calculatedTotal += product.price * item.quantity;
    }

    const orderTotal = Math.round(calculatedTotal * 100) / 100;

    // Create the POS order
    const order = new Order({
      user: customerId || undefined,
      items: processedItems,
      totalAmount: orderTotal,
      status: 'Delivered', // Instantly completed in store
      channel: 'POS',
      paymentMethod,
      registerSessionId,
      cashierId: decoded.id,
      amountPaidCash: paymentMethod === 'Cash' ? orderTotal : (paymentMethod === 'Split' ? amountPaidCash : 0),
      amountPaidCard: paymentMethod === 'Card' ? orderTotal : (paymentMethod === 'Split' ? amountPaidCard : 0)
    });

    await order.save();

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error('POS Checkout error:', error);
    return NextResponse.json({ message: 'Server error during POS checkout' }, { status: 500 });
  }
}
