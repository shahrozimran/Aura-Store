import mongoose from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  title: string;
  imageUrl: string;
  quantity: number;
  price: number;
}

export interface IShippingAddress {
  fullName: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface IOrder extends mongoose.Document {
  user?: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  shippingAddress?: IShippingAddress;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  channel: 'Web' | 'POS';
  paymentMethod: 'Cash' | 'Card' | 'Split' | 'Other';
  registerSessionId?: mongoose.Types.ObjectId;
  cashierId?: mongoose.Types.ObjectId;
  amountPaidCash?: number;
  amountPaidCard?: number;
  createdAt: Date;
}

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Product title is required']
  },
  imageUrl: {
    type: String,
    required: [true, 'Product image URL is required']
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  shippingAddress: {
    fullName: { type: String, required: false },
    addressLine1: { type: String, required: false },
    city: { type: String, required: false },
    postalCode: { type: String, required: false },
    country: { type: String, required: false }
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  channel: {
    type: String,
    enum: ['Web', 'POS'],
    default: 'Web'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'Split', 'Other'],
    default: 'Card'
  },
  registerSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RegisterSession',
    required: false
  },
  cashierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  amountPaidCash: { type: Number, default: 0 },
  amountPaidCard: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);
export default Order;
