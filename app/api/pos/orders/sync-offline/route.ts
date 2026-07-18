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

    const { orders } = await req.json();
    if (!orders || !Array.isArray(orders)) {
      return NextResponse.json({ message: 'Missing or invalid orders array' }, { status: 400 });
    }

    const syncReport = [];

    for (const offlineOrder of orders) {
      const {
        items,
        paymentMethod,
        amountPaidCash,
        amountPaidCard,
        customerId,
        locationId,
        registerSessionId,
        localId,
        createdAt
      } = offlineOrder;

      try {
        if (!items || items.length === 0 || !paymentMethod || !locationId || !registerSessionId) {
          throw new Error('Missing required checkout fields');
        }

        // Verify register session exists
        const session = await RegisterSession.findById(registerSessionId);
        if (!session) {
          throw new Error('Register session not found');
        }

        let calculatedTotal = 0;
        const processedItems = [];
        const rollbackList = [];

        // Concurrency Safe Inventory Check & Decrement
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
            throw new Error(`Product with ID ${item.product} not found`);
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
            throw new Error(`Insufficient stock for product: ${product.title}. Only ${locStock ? locStock.stock : 0} items left.`);
          }

          // Atomically decrement stock
          const updateResult = await Product.updateOne(
            {
              _id: product._id,
              "stockAtLocations.locationId": locationId,
              "stockAtLocations.stock": { $gte: item.quantity }
            },
            {
              $inc: { "stockAtLocations.$.stock": -item.quantity }
            }
          );

          if (updateResult.modifiedCount === 0) {
            // Rollback already updated items
            for (const rb of rollbackList) {
              await Product.updateOne(
                { _id: rb.productId, "stockAtLocations.locationId": locationId },
                { $inc: { "stockAtLocations.$.stock": rb.quantity } }
              );
            }
            throw new Error(`Concurrency collision occurred for product: ${product.title}`);
          }

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
          status: 'Delivered',
          channel: 'POS',
          paymentMethod,
          registerSessionId,
          cashierId: decoded.id,
          amountPaidCash: paymentMethod === 'Cash' ? orderTotal : (paymentMethod === 'Split' ? amountPaidCash : 0),
          amountPaidCard: paymentMethod === 'Card' ? orderTotal : (paymentMethod === 'Split' ? amountPaidCard : 0),
          createdAt: createdAt ? new Date(createdAt) : new Date()
        });

        await order.save();

        syncReport.push({
          localId,
          status: 'Synced',
          orderId: order._id
        });
      } catch (err: any) {
        console.error(`Offline sync failed for order localId ${localId}:`, err.message);
        syncReport.push({
          localId,
          status: 'Failed',
          error: err.message || 'Checkout failed during syncing'
        });
      }
    }

    return NextResponse.json({ report: syncReport });
  } catch (error: any) {
    console.error('Offline orders batch sync error:', error);
    return NextResponse.json({ message: 'Server error during batch offline sync' }, { status: 500 });
  }
}
