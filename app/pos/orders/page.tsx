'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface OrderItem {
  product: string;
  title: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  user?: {
    username: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  shippingAddress?: {
    fullName: string;
    addressLine1: string;
    city: string;
    postalCode: string;
    country: string;
  };
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  channel: 'Web' | 'POS';
  paymentMethod: string;
  createdAt: string;
}

export default function POSOrdersPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterChannel, setFilterChannel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Auth Protection Check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?redirect=/pos/orders');
    }
  }, [user, authLoading, router]);

  async function loadOrders() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/pos/orders?channel=${filterChannel}&status=${filterStatus}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadOrders();
    }
  }, [token, filterChannel, filterStatus]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/pos/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update order status');
      }

      // Reload order list
      loadOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (authLoading || loading) {
    return <div className="loading-spinner" style={{ marginTop: '5rem' }}></div>;
  }

  return (
    <div>
      {/* Header and filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 500 }}>Orders Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Monitor, track, and update fulfillment statuses for Web and POS channels.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          {/* Channel Filter */}
          <div className="select-wrapper">
            <select
              style={{ fontSize: '0.85rem', padding: '0.5rem 2rem 0.5rem 1rem' }}
              value={filterChannel}
              onChange={(e) => setFilterChannel(e.target.value)}
            >
              <option value="all">All Channels</option>
              <option value="Web">Web (Online)</option>
              <option value="POS">POS (Retail)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="select-wrapper">
            <select
              style={{ fontSize: '0.85rem', padding: '0.5rem 2rem 0.5rem 1rem' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="white-container" style={{ padding: '0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: 'var(--border-thin)', backgroundColor: 'rgba(245,242,235,0.4)' }}>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Order ID</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Channel</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Customer</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Total</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Fulfillment Status</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No orders found matching the filter criteria.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} style={{ borderBottom: '1px solid rgba(34,34,34,0.05)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                    {order._id.slice(-8).toUpperCase()}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>
                    <span className={`badge badge-${order.channel === 'POS' ? 'pos' : 'web'}`} style={{
                      backgroundColor: order.channel === 'POS' ? 'rgba(34,34,34,0.05)' : 'rgba(85,122,70,0.1)',
                      color: order.channel === 'POS' ? 'var(--text-charcoal)' : '#557A46',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 500
                    }}>
                      {order.channel}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>
                    {order.user ? (
                      <div>
                        <strong>{order.user.username}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.user.email}</div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Walk-in Customer</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>
                    <div className="select-wrapper" style={{ display: 'inline-block' }}>
                      <select
                        style={{
                          fontSize: '0.8rem',
                          padding: '0.2rem 1.5rem 0.2rem 0.5rem',
                          border: 'var(--border-thin)',
                          backgroundColor: 'transparent'
                        }}
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem' }}>
                    <button
                      className="btn-secondary"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => setSelectedOrder(order)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="logout-overlay">
          <div className="logout-content" style={{ maxWidth: '500px', textAlign: 'left', padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: 'var(--border-thin)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Order Details</h3>
              <button 
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
                onClick={() => setSelectedOrder(null)}
              >
                &times;
              </button>
            </div>

            <div style={{ fontSize: '0.85rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Order ID</span>
                <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedOrder._id.toUpperCase()}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Channel & Payment</span>
                <div>{selectedOrder.channel} ({selectedOrder.paymentMethod})</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Fulfillment Status</span>
                <div><strong>{selectedOrder.status}</strong></div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Purchase Date</span>
                <div>{new Date(selectedOrder.createdAt).toLocaleString()}</div>
              </div>
            </div>

            {/* Shipping Address (if Web) */}
            {selectedOrder.shippingAddress && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(245,242,235,0.4)', border: 'var(--border-thin)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Shipping Address</span>
                <strong>{selectedOrder.shippingAddress.fullName}</strong>
                <div>{selectedOrder.shippingAddress.addressLine1}</div>
                <div>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</div>
                <div>{selectedOrder.shippingAddress.country}</div>
              </div>
            )}

            {/* Order Items */}
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Items</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid rgba(34,34,34,0.03)', paddingBottom: '0.5rem' }}>
                    <span>{item.title} <strong>(x{item.quantity})</strong></span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.9rem', marginTop: '0.75rem', borderTop: 'var(--border-thin)', paddingTop: '0.5rem' }}>
                <span>Total Amount</span>
                <span>${selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn-primary" 
                style={{ padding: '0.5rem 1.5rem', fontSize: '0.85rem' }}
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
