import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const sort = searchParams.get('sort');
    const search = searchParams.get('search');

    const query: any = {};

    // Filter by category
    if (category && category !== 'all') {
      const cleanCategory = category.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      query.category = { $regex: new RegExp(cleanCategory, 'i') };
    }

    // Filter by search query (case-insensitive with ReDoS protection)
    if (search) {
      const cleanSearch = search.trim().slice(0, 80);
      const escapedSearch = cleanSearch.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      query.title = { $regex: new RegExp(escapedSearch, 'i') };
    }

    let productsQuery = Product.find(query);

    // Sorting by price
    if (sort) {
      if (sort === 'price-asc') {
        productsQuery = productsQuery.sort({ price: 1 });
      } else if (sort === 'price-desc') {
        productsQuery = productsQuery.sort({ price: -1 });
      }
    } else {
      // Default: sort by newest
      productsQuery = productsQuery.sort({ createdAt: -1 });
    }

    const products = await productsQuery;
    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Fetch Products Error:', error);
    return NextResponse.json({ message: 'Server error fetching products' }, { status: 500 });
  }
}
