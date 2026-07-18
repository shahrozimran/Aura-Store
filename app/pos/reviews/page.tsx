'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface Review {
  reviewId: string;
  productId: string;
  productTitle: string;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function POSReviewsPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth Protection Check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?redirect=/pos/reviews');
    }
  }, [user, authLoading, router]);

  async function loadReviews() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/pos/reviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setReviews(data);
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadReviews();
    }
  }, [token]);

  const handleDeleteReview = async (productId: string, reviewId: string) => {
    if (!confirm('Are you sure you want to delete this customer review?')) return;

    try {
      const res = await fetch(`/api/pos/reviews?productId=${productId}&reviewId=${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete review');
      }

      loadReviews();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (authLoading || loading) {
    return <div className="loading-spinner" style={{ marginTop: '5rem' }}></div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 500 }}>Customer Reviews Moderation</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Inspect and moderate product reviews and ratings submitted by online store customers.
        </p>
      </div>

      {/* Reviews Table */}
      <div className="white-container" style={{ padding: '0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: 'var(--border-thin)', backgroundColor: 'rgba(245,242,235,0.4)' }}>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Product</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Rating</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Author</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Comment</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No customer reviews found.
                </td>
              </tr>
            ) : (
              reviews.map((rev) => (
                <tr key={rev.reviewId} style={{ borderBottom: '1px solid rgba(34,34,34,0.05)' }}>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
                    {rev.productTitle}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: '#EBA036', letterSpacing: '0.05em' }}>
                    {renderStars(rev.rating)}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
                    {rev.username}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', maxWidth: '300px' }}>
                    {rev.comment}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem' }}>
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem' }}>
                    <button
                      className="btn-remove"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => handleDeleteReview(rev.productId, rev.reviewId)}
                    >
                      Delete Review
                    </button>
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
