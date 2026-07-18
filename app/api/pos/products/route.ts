import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const {
      title,
      sku,
      barcode,
      description,
      features,
      price,
      imageUrl,
      category,
      stock,
      stockAtLocations
    } = await req.json();

    if (!title || !sku || price === undefined || !imageUrl || !category || stock === undefined) {
      return NextResponse.json({ message: 'Missing required product fields' }, { status: 400 });
    }

    // Check if SKU already exists
    const existingSku = await Product.findOne({ sku });
    if (existingSku) {
      return NextResponse.json({ message: 'A product with this SKU already exists' }, { status: 400 });
    }

    // Check if Barcode already exists (if provided)
    if (barcode) {
      const existingBarcode = await Product.findOne({ barcode });
      if (existingBarcode) {
        return NextResponse.json({ message: 'A product with this barcode already exists' }, { status: 400 });
      }
    }

    const newProduct = new Product({
      title,
      sku,
      barcode: barcode || undefined,
      description: description || 'No description provided.',
      features: features || [],
      price: Number(price),
      imageUrl,
      category,
      stock: Number(stock),
      stockAtLocations: stockAtLocations || []
    });

    await newProduct.save();
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error('POS Products POST error:', error);
    return NextResponse.json({ message: error.message || 'Server error creating product' }, { status: 500 });
  }
}
