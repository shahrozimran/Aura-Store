import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ message: 'Authorization denied. Invalid or missing token.' }, { status: 401 });
    }

    const orders = await Order.find({ user: decoded.id })
      .populate('items.product', 'title imageUrl')
      .sort({ createdAt: -1 });

    const response = NextResponse.json(orders);
    // Emulate Express Cache-Control header
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    return response;
  } catch (error: any) {
    console.error('Fetch Orders Error:', error);
    return NextResponse.json({ message: 'Server error fetching orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ message: 'Authorization denied. Invalid or missing token.' }, { status: 401 });
    }

    const { items, shippingAddress } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ message: 'No items in the order' }, { status: 400 });
    }

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.addressLine1 ||
      !shippingAddress.city ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      return NextResponse.json({ message: 'Please provide full shipping details' }, { status: 400 });
    }

    let calculatedTotal = 0;
    const processedItems = [];
    const productsToUpdate = [];

    // PASS 1: Verify all products exist and have sufficient stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return NextResponse.json({ message: `Product with ID ${item.product} not found` }, { status: 404 });
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { message: `Insufficient stock for product: ${product.title}. Only ${product.stock} items left.` },
          { status: 400 }
        );
      }

      // Add to processed items with snapshotted fields
      processedItems.push({
        product: product._id,
        title: product.title,
        imageUrl: product.imageUrl,
        quantity: item.quantity,
        price: product.price
      });

      calculatedTotal += product.price * item.quantity;

      // Track updated product state for Pass 2
      product.stock -= item.quantity;
      productsToUpdate.push(product);
    }

    // PASS 2: Save the updated stock levels (all-or-nothing check succeeded)
    for (const product of productsToUpdate) {
      await product.save();
    }

    // Save order
    const order = new Order({
      user: decoded.id,
      items: processedItems,
      totalAmount: Math.round(calculatedTotal * 100) / 100, // Round to 2 decimal places
      shippingAddress
    });

    await order.save();

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error('Create Order Error:', error);
    return NextResponse.json({ message: 'Server error processing order' }, { status: 500 });
  }
}
