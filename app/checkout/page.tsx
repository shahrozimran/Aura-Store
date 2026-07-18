'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const { cart, subtotal, tax, total, clearCart } = useCart();

  const [fullName, setFullName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Security Check: Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?redirect=/checkout');
    }
  }, [user, authLoading, router]);

  // Cart Check: Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0 && !isSubmitting) {
      router.push('/cart');
    }
  }, [cart, router, isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!fullName.trim() || !addressLine1.trim() || !city.trim() || !postalCode.trim() || !country.trim()) {
      setAlert({ message: 'Please fill in all shipping fields', type: 'error' });
      return;
    }

    setIsSubmitting(true);

    const shippingAddress = {
      fullName: fullName.trim(),
      addressLine1: addressLine1.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      country: country.trim()
    };

    const orderItems = cart.map((item) => ({
      product: item.product,
      quantity: item.quantity
    }));

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ items: orderItems, shippingAddress })
      });

      const data = await res.ok ? await res.json() : null;

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to place order');
      }

      setAlert({ message: 'Order placed successfully! Redirecting...', type: 'success' });
      clearCart();

      setTimeout(() => {
        router.push('/orders');
      }, 1500);
    } catch (err: any) {
      setAlert({ message: err.message || 'Something went wrong processing your order.', type: 'error' });
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return <div className="loading-spinner" style={{ marginTop: '5rem' }}></div>;
  }

  return (
    <main>
      <h1 className="page-title">Checkout</h1>

      {alert && (
        <div className={`alert alert-${alert.type}`} style={{ maxWidth: '800px', margin: '0 auto 2rem auto' }}>
          {alert.message}
        </div>
      )}

      <div className="cart-page-layout">
        {/* Shipping Form Panel */}
        <form onSubmit={handleSubmit} className="white-container" style={{ padding: '2.5rem' }}>
          <h2 className="summary-title" style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            Shipping Address
          </h2>
          <div className="form-group">
            <label className="form-label" htmlFor="ship-name">
              Full Name
            </label>
            <input
              type="text"
              id="ship-name"
              className="form-control"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="ship-address">
              Address Line 1
            </label>
            <input
              type="text"
              id="ship-address"
              className="form-control"
              required
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="ship-city">
              City
            </label>
            <input
              type="text"
              id="ship-city"
              className="form-control"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="ship-zip">
                Zip / Postal Code
              </label>
              <input
                type="text"
                id="ship-zip"
                className="form-control"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ship-country">
                Country
              </label>
              <input
                type="text"
                id="ship-country"
                className="form-control"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" style={{ display: 'none' }} id="hidden-submit" />
        </form>

        {/* Order Review panel */}
        <div className="summary-card">
          <h2 className="summary-title">Review Order</h2>
          <div id="checkout-items-list" style={{ borderBottom: 'var(--border-thin)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            {cart.map((item) => (
              <div
                key={item.product}
                className="summary-row"
                style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}
              >
                <span style={{ color: 'var(--text-muted)' }}>
                  {item.title} (x{item.quantity})
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Estimated Tax (10%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            type="button"
            className="btn-primary"
            style={{ width: '100%' }}
            onClick={(e) => {
              const form = e.currentTarget.closest('.cart-page-layout')?.querySelector('form');
              if (form) form.requestSubmit();
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Complete Order'}
          </button>
        </div>
      </div>
    </main>
  );
}
