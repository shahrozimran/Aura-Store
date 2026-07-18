'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, subtotal, tax, total, updateCartQuantity, removeFromCart } = useCart();

  const handleCheckoutClick = () => {
    if (user) {
      router.push('/checkout');
    } else {
      router.push('/auth?redirect=/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <main>
        <div className="empty-state">
          <div className="empty-state-icon">Ø</div>
          <h2 className="empty-state-title">Your Cart is Empty</h2>
          <p className="empty-state-desc">You haven&apos;t added any objects to your collection yet.</p>
          <Link href="/" className="btn-secondary">
            Go to Shop
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <h1 className="page-title">Shopping Cart</h1>
      <div className="cart-page-layout" id="cart-layout">
        {/* Cart Items List */}
        <div className="cart-items-container" id="cart-items">
          {cart.map((item) => (
            <div key={item.product} className="cart-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                className="cart-item-img"
                alt={item.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://placehold.co/120x120/FAF8F5/222222?text=${encodeURIComponent(
                    item.title
                  )}`;
                }}
              />
              <div className="cart-item-details">
                <h3 className="cart-item-title">{item.title}</h3>
                <p className="cart-item-category">Selected Item</p>
                <div className="cart-item-price">${item.price.toFixed(2)}</div>
              </div>
              <div className="cart-item-controls">
                <div className="cart-item-qty">
                  <button
                    className="cart-item-qty-btn btn-decrease"
                    onClick={() => {
                      if (item.quantity > 1) {
                        updateCartQuantity(item.product, item.quantity - 1, item.maxStock);
                      }
                    }}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    className="cart-item-qty-input"
                    value={item.quantity}
                    readOnly
                  />
                  <button
                    className="cart-item-qty-btn btn-increase"
                    onClick={() => {
                      if (item.quantity < item.maxStock) {
                        updateCartQuantity(item.product, item.quantity + 1, item.maxStock);
                      } else {
                        alert(`Only ${item.maxStock} units of this item are available in stock.`);
                      }
                    }}
                    disabled={item.quantity >= item.maxStock}
                  >
                    +
                  </button>
                </div>
                <button className="btn-remove" onClick={() => removeFromCart(item.product)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Box */}
        <div className="summary-card">
          <h2 className="summary-title">Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span id="cart-subtotal">${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Estimated Tax (10%)</span>
            <span id="cart-tax">${tax.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span id="cart-total">${total.toFixed(2)}</span>
          </div>
          <button id="btn-checkout" className="btn-primary" style={{ width: '100%' }} onClick={handleCheckoutClick}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </main>
  );
}
