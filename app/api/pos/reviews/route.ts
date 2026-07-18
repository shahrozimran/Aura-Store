import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const products = await Product.find({ "reviews.0": { $exists: true } }).select('title reviews');
    
    const allReviews: any[] = [];
    products.forEach((product) => {
      product.reviews.forEach((review: any) => {
        allReviews.push({
          reviewId: review._id,
          productId: product._id,
          productTitle: product.title,
          username: review.username,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt
        });
      });
    });

    // Sort by newest first
    allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(allReviews);
  } catch (error: any) {
    console.error('POS Reviews GET error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const reviewId = searchParams.get('reviewId');

    if (!productId || !reviewId) {
      return NextResponse.json({ message: 'Missing productId or reviewId' }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Filter out the moderated review
    product.reviews = product.reviews.filter((r: any) => r._id.toString() !== reviewId);
    await product.save();

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error: any) {
    console.error('POS Reviews DELETE error:', error);
    return NextResponse.json({ message: 'Server error deleting review' }, { status: 500 });
  }
}
