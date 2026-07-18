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
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Aggregate total sales and sales by channel
    const salesData = await Order.aggregate([
      {
        $group: {
          _id: '$channel',
          totalAmount: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const channelStats = {
      Web: { totalAmount: 0, count: 0 },
      POS: { totalAmount: 0, count: 0 }
    };

    let totalRevenue = 0;
    let totalTransactions = 0;

    salesData.forEach((stat) => {
      const channel = (stat._id === 'POS' ? 'POS' : 'Web') as 'POS' | 'Web';
      channelStats[channel] = {
        totalAmount: Math.round(stat.totalAmount * 100) / 100,
        count: stat.count
      };
      totalRevenue += stat.totalAmount;
      totalTransactions += stat.count;
    });

    totalRevenue = Math.round(totalRevenue * 100) / 100;

    // Find products with low stock (e.g. less than 5 units at ANY location or base stock)
    const lowStockProducts = await Product.find({
      $or: [
        { stock: { $lt: 5 } },
        { "stockAtLocations.stock": { $lt: 5 } }
      ]
    }).select('title sku stock stockAtLocations');

    // Aggregate best selling items (top 5)
    const bestSellers = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          title: { $first: '$items.title' },
          quantitySold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 5 }
    ]);

    return NextResponse.json({
      revenue: totalRevenue,
      transactions: totalTransactions,
      channelStats,
      lowStock: lowStockProducts,
      bestSellers
    });
  } catch (error: any) {
    console.error('Analytics GET error:', error);
    return NextResponse.json({ message: 'Server error retrieving analytics' }, { status: 500 });
  }
}
