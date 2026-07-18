import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';
import { verifyAuth } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Update fields
    if (body.title !== undefined) product.title = body.title;
    if (body.price !== undefined) product.price = Number(body.price);
    if (body.description !== undefined) product.description = body.description;
    if (body.imageUrl !== undefined) product.imageUrl = body.imageUrl;
    if (body.category !== undefined) product.category = body.category;
    if (body.features !== undefined) product.features = body.features;
    if (body.sku !== undefined) product.sku = body.sku;
    if (body.barcode !== undefined) product.barcode = body.barcode || undefined;
    if (body.stock !== undefined) product.stock = Number(body.stock);
    if (body.stockAtLocations !== undefined) product.stockAtLocations = body.stockAtLocations;

    await product.save();
    return NextResponse.json(product);
  } catch (error: any) {
    console.error('POS Products PUT error:', error);
    return NextResponse.json({ message: error.message || 'Server error updating product' }, { status: 500 });
  }
}
