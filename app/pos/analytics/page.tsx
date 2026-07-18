'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface AnalyticsData {
  revenue: number;
  transactions: number;
  channelStats: {
    Web: { totalAmount: number; count: number };
    POS: { totalAmount: number; count: number };
  };
  lowStock: {
    _id: string;
    title: string;
    sku: string;
    stock: number;
  }[];
  bestSellers: {
    _id: string;
    title: string;
    quantitySold: number;
    revenue: number;
  }[];
}

export default function POSAnalyticsPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth Protection Check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?redirect=/pos/analytics');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function loadAnalytics() {
      if (!token) return;
      try {
        const res = await fetch('/api/pos/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setAnalytics(data);
        }
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    if (token) {
      loadAnalytics();
    }
  }, [token]);

  if (authLoading || loading) {
    return <div className="loading-spinner" style={{ marginTop: '5rem' }}></div>;
  }

  if (!analytics) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Failed to retrieve metrics logs.</div>;
  }

  const webRevenue = analytics.channelStats.Web.totalAmount;
  const posRevenue = analytics.channelStats.POS.totalAmount;
  const totalRevenue = analytics.revenue || (webRevenue + posRevenue);
  
  const webPercent = totalRevenue > 0 ? (webRevenue / totalRevenue) * 100 : 50;
  const posPercent = totalRevenue > 0 ? (posRevenue / totalRevenue) * 100 : 50;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 500 }}>Channel Revenue & Analytics</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Real-time overview of revenue distribution, top product metrics, and warning reports.
        </p>
      </div>

      {/* Analytics KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '2.5rem' }}>
        <div className="white-container" style={{ padding: '2rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Sales Revenue
          </span>
          <h3 style={{ fontSize: '2.2rem', fontWeight: 300, color: 'var(--text-charcoal)', marginTop: '0.5rem' }}>
            ${totalRevenue.toFixed(2)}
          </h3>
        </div>
        <div className="white-container" style={{ padding: '2rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Transactions
          </span>
          <h3 style={{ fontSize: '2.2rem', fontWeight: 300, color: 'var(--text-charcoal)', marginTop: '0.5rem' }}>
            {analytics.transactions}
          </h3>
        </div>
        <div className="white-container" style={{ padding: '2rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Average Order Value
          </span>
          <h3 style={{ fontSize: '2.2rem', fontWeight: 300, color: 'var(--text-charcoal)', marginTop: '0.5rem' }}>
            ${analytics.transactions > 0 ? (totalRevenue / analytics.transactions).toFixed(2) : '0.00'}
          </h3>
        </div>
      </div>

      {/* Splits details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        
        {/* Channel Splits Progress block */}
        <div className="white-container" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 500, marginBottom: '1.5rem' }}>Sales Channel Distribution</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Web */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <span>Web Channel (Online Store)</span>
                <strong>${webRevenue.toFixed(2)} ({webPercent.toFixed(1)}%)</strong>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(34,34,34,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${webPercent}%`, height: '100%', backgroundColor: '#557A46' }} />
              </div>
            </div>

            {/* POS */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <span>POS Channel (Retail Store)</span>
                <strong>${posRevenue.toFixed(2)} ({posPercent.toFixed(1)}%)</strong>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(34,34,34,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${posPercent}%`, height: '100%', backgroundColor: 'var(--text-charcoal)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Best Sellers Grid */}
        <div className="white-container" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 500, marginBottom: '1.25rem' }}>Top 5 Best-Selling Products</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: 'var(--border-thin)', color: 'var(--text-muted)' }}>
                <th style={{ paddingBottom: '0.5rem' }}>Product Title</th>
                <th style={{ paddingBottom: '0.5rem', textAlign: 'center' }}>Units Sold</th>
                <th style={{ paddingBottom: '0.5rem', textAlign: 'right' }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics.bestSellers.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ paddingTop: '1rem', color: 'var(--text-muted)' }}>No sales transactions found.</td>
                </tr>
              ) : (
                analytics.bestSellers.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid rgba(34,34,34,0.03)' }}>
                    <td style={{ padding: '0.75rem 0' }}>{item.title}</td>
                    <td style={{ padding: '0.75rem 0', textAlign: 'center' }}>{item.quantitySold}</td>
                    <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 500 }}>${item.revenue.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warnings & alerts */}
      <div className="white-container" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 500, marginBottom: '1.25rem', color: '#A73121' }}>
          ⚠️ Low-Stock Alerts
        </h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: 'var(--border-thin)', color: 'var(--text-muted)' }}>
              <th style={{ paddingBottom: '0.5rem' }}>Product</th>
              <th style={{ paddingBottom: '0.5rem' }}>SKU</th>
              <th style={{ paddingBottom: '0.5rem' }}>Global Stock</th>
              <th style={{ paddingBottom: '0.5rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {analytics.lowStock.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ paddingTop: '1.5rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  All items are sufficiently stocked.
                </td>
              </tr>
            ) : (
              analytics.lowStock.map((p, index) => (
                <tr key={index} style={{ borderBottom: '1px solid rgba(34,34,34,0.03)' }}>
                  <td style={{ padding: '0.75rem 0' }}>{p.title}</td>
                  <td style={{ padding: '0.75rem 0', fontFamily: 'monospace' }}>{p.sku}</td>
                  <td style={{ padding: '0.75rem 0', fontWeight: 600 }}>{p.stock} units</td>
                  <td style={{ padding: '0.75rem 0' }}>
                    <span style={{
                      backgroundColor: p.stock === 0 ? 'rgba(167,49,33,0.1)' : 'rgba(235,160,54,0.1)',
                      color: p.stock === 0 ? '#A73121' : '#EBA036',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 500
                    }}>
                      {p.stock === 0 ? 'OUT OF STOCK' : 'CRITICAL STOCK'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
