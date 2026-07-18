'use client';

import React, { use, useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';

interface Review {
  username: string;
  rating: number;
  comment: string;
  _id: string;
  createdAt: string;
}

interface Product {
  _id: string;
  title: string;
  description: string;
  features: string[];
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  reviews: Review[];
}

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const { id: productId } = use(params);
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQty, setSelectedQty] = useState(1);
  const [addedText, setAddedText] = useState('Add to Cart');
  const [addedDisabled, setAddedDisabled] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch product');
        }
        setProduct(data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const handleDecrease = () => {
    if (selectedQty > 1) {
      setSelectedQty(selectedQty - 1);
    }
  };

  const handleIncrease = () => {
    if (product && selectedQty < product.stock) {
      setSelectedQty(selectedQty + 1);
    } else if (product) {
      alert(`Only ${product.stock} items in stock.`);
    }
  };

  const handleAddToCartClick = () => {
    if (!product) return;

    const success = addToCart(
      product._id,
      selectedQty,
      product.title,
      product.price,
      product.imageUrl,
      product.stock
    );

    if (success) {
      setAddedText('Added to Cart');
      setAddedDisabled(true);
      setTimeout(() => {
        setAddedText('Add to Cart');
        setAddedDisabled(false);
      }, 1500);
    }
  };

  if (loading) {
    return <div className="loading-spinner" style={{ marginTop: '5rem' }}></div>;
  }

  if (error || !product) {
    return (
      <main>
        <div className="alert alert-error" style={{ textAlign: 'center' }}>
          Error: {error || 'Product not found'}
        </div>
      </main>
    );
  }

  const inStock = product.stock > 0;

  return (
    <main>
      <div className="product-detail-container">
        {/* Left Side: Product Image */}
        <div className="detail-image-panel">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            className="detail-image"
            alt={product.title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://placehold.co/600x600/FAF8F5/222222?text=${encodeURIComponent(
                product.title
              )}`;
            }}
          />
        </div>

        {/* Right Side: Product Information */}
        <div className="detail-info-panel">
          <span className="detail-cat">{product.category}</span>
          <h1 className="detail-title">{product.title}</h1>
          <div className="detail-price">${product.price.toFixed(2)}</div>
          <p className="detail-desc">{product.description}</p>

          {/* Action Row: Quantity & Add to Cart */}
          <div className="action-row">
            <div className="quantity-selector">
              <button
                className="qty-btn"
                onClick={handleDecrease}
                disabled={!inStock || selectedQty <= 1}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <input
                type="text"
                className="qty-input"
                value={inStock ? selectedQty : 0}
                readOnly
                aria-label="Current quantity"
              />
              <button
                className="qty-btn"
                onClick={handleIncrease}
                disabled={!inStock || (product && selectedQty >= product.stock)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button
              className="btn-primary"
              onClick={handleAddToCartClick}
              disabled={!inStock || addedDisabled}
              style={{ flex: 1 }}
            >
              {inStock ? addedText : 'Sold Out'}
            </button>
          </div>

          {/* Stock Status Badge */}
          <div className={`stock-status ${inStock ? 'in-stock' : 'out-of-stock'}`}>
            {inStock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
          </div>

          {/* Specifications / Features List */}
          <div style={{ marginTop: '3rem', borderTop: 'var(--border-thin)', paddingTop: '2rem' }}>
            <h3 className="summary-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
              Specifications
            </h3>
            <ul id="product-features" style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)' }}>
              {product.features && product.features.length > 0 ? (
                product.features.map((feat, index) => <li key={index} style={{ marginBottom: '0.5rem' }}>{feat}</li>)
              ) : (
                <li>No specifications listed</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Product Reviews Section */}
      {product.reviews && product.reviews.length > 0 && (
        <div id="reviews-section" style={{ marginTop: '5rem', borderTop: 'var(--border-thin)', paddingTop: '4rem' }}>
          <h2 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>
            Customer Reviews
          </h2>
          <div className="reviews-grid" id="reviews-list">
            {product.reviews.map((rev) => {
              const stars = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);
              return (
                <div key={rev._id} className="review-card">
                  <div className="review-header">
                    <span className="review-user">{rev.username}</span>
                    <span className="review-stars">{stars}</span>
                  </div>
                  <p className="review-comment">{rev.comment}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
