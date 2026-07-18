'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface OrderItem {
  product: {
    _id: string;
    title?: string;
    imageUrl?: string;
  } | string | null;
  title: string;
  imageUrl: string;
  quantity: number;
  price: number;
  _id: string;
}

interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  country: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth Redirect check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?redirect=/orders');
    }
  }, [user, authLoading, router]);

  // Load orders from API
  useEffect(() => {
    async function loadOrders() {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/orders', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch orders');
        }
        setOrders(data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    if (token) {
      loadOrders();
    }
  }, [token]);

  if (authLoading || (!user && loading)) {
    return <div className="loading-spinner" style={{ marginTop: '5rem' }}></div>;
  }

  if (loading) {
    return (
      <main>
        <h1 className="page-title">My Orders</h1>
        <div className="loading-spinner"></div>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1 className="page-title">My Orders</h1>
        <div className="alert alert-error" style={{ textAlign: 'center' }}>
          Error: {error}
        </div>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main>
        <div className="empty-state">
          <div className="empty-state-icon">Ø</div>
          <h2 className="empty-state-title">No Orders Found</h2>
          <p className="empty-state-desc">You haven&apos;t placed any orders yet.</p>
          <Link href="/" className="btn-secondary">
            Shop Our Collection
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <h1 className="page-title">My Orders</h1>
      <div className="orders-list">
        {orders.map((order) => {
          const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          const statusClass = `status-${order.status.toLowerCase()}`;

          return (
            <div key={order._id} className="order-card">
              {/* Order Header info block */}
              <div className="order-header">
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  <div className="order-meta-item">
                    <div className="order-meta-label">Order Number</div>
                    <div className="order-meta-value" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {order._id}
                    </div>
                  </div>
                  <div className="order-meta-item">
                    <div className="order-meta-label">Date Placed</div>
                    <div className="order-meta-value">{orderDate}</div>
                  </div>
                  <div className="order-meta-item">
                    <div className="order-meta-label">Total Paid</div>
                    <div className="order-meta-value" style={{ fontSize: '1rem' }}>
                      ${order.totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div>
                  <span className={`order-status-badge ${statusClass}`}>{order.status}</span>
                </div>
              </div>

              {/* Order content detail block */}
              <div className="cart-page-layout" style={{ gap: '3rem' }}>
                <div className="order-items-grid">
                  {order.items.map((item) => {
                    const productObj = typeof item.product === 'object' ? item.product : null;
                    const pId = productObj?._id || (typeof item.product === 'string' ? item.product : null);

                    const title = item.title || productObj?.title || 'Deleted Product';
                    const imgUrl = item.imageUrl || productObj?.imageUrl || 'https://placehold.co/100x100';

                    return (
                      <div key={item._id} className="order-item-row" style={{ borderBottom: '1px solid rgba(34,34,34,0.03)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                        <div className="order-item-info">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgUrl}
                            className="order-item-img"
                            alt={title}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = `https://placehold.co/100x100/FAF8F5/222222?text=${encodeURIComponent(
                                title
                              )}`;
                            }}
                          />
                          <div>
                            <div className="order-item-title">
                              {pId ? (
                                <Link href={`/product/${pId}`} style={{ color: 'inherit', textDecoration: 'none' }} className="hover:underline">
                                  {title}
                                </Link>
                              ) : (
                                title
                              )}
                            </div>
                            <div className="order-item-qty-price">
                              Qty: {item.quantity} × ${item.price.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <div style={{ fontWeight: 500 }}>${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Shipping summary block */}
                <div style={{ fontSize: '0.9rem', borderLeft: 'var(--border-thin)', paddingLeft: '1.5rem' }}>
                  <div className="order-meta-label" style={{ marginBottom: '0.5rem' }}>
                    Shipping Address
                  </div>
                  <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{order.shippingAddress.fullName}</div>
                  <div style={{ color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    {order.shippingAddress.addressLine1}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                    <br />
                    {order.shippingAddress.country}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
