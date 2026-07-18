'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Product {
  _id: string;
  title: string;
  category: string;
  price: number;
  imageUrl: string;
}

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Autocomplete Suggestions State
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debouncing Suggestions fetch
  useEffect(() => {
    if (searchInput.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const queryStr = encodeURIComponent(searchInput.trim().slice(0, 80));
        const res = await fetch(`/api/products?category=all&search=${queryStr}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.slice(0, 5));
        }
      } catch (err) {
        console.error('Suggestions fetch error:', err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch catalog products
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        let url = `/api/products?category=${category}`;
        if (sort) url += `&sort=${sort}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;

        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to load products');
        }
        setProducts(data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [category, sort, search]);

  // Click outside to dismiss suggestions
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setShowSuggestions(false);
  };

  const handleCategoryClick = (cat: string) => {
    setCategory(cat);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">Simplicity in Form & Function</h1>
        <p className="hero-subtitle">
          A collection of thoughtfully crafted objects for the modern, minimalist living space.
        </p>

        {/* Search Bar Container */}
        <div className="search-container" ref={searchContainerRef}>
          <form id="search-form" autoComplete="off" onSubmit={handleSearchSubmit}>
            <div className="search-wrapper">
              <svg
                className="search-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                id="search-input"
                placeholder="Search objects..."
                aria-label="Search products"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
              />
              <button type="submit" className="search-submit-btn">
                Search
              </button>
            </div>
          </form>

          {/* Auto Suggestions Dropdown */}
          {showSuggestions && searchInput.trim().length > 0 && (
            <div className="search-suggestions">
              {suggestions.length === 0 ? (
                <div className="suggestion-no-results">No matching objects found</div>
              ) : (
                suggestions.map((prod) => (
                  <div
                    key={prod._id}
                    className="suggestion-item"
                    onClick={() => {
                      router.push(`/product/${prod._id}`);
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="suggestion-img"
                      src={prod.imageUrl}
                      alt={prod.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://placehold.co/50x50/FAF8F5/222222?text=${encodeURIComponent(
                          prod.title
                        )}`;
                      }}
                    />
                    <div className="suggestion-details">
                      <span className="suggestion-title">{prod.title}</span>
                      <span className="suggestion-cat">{prod.category}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {/* Main Catalog View */}
      <main style={{ paddingTop: 0 }}>
        {/* Catalog Filters & Controls */}
        <div className="catalog-controls">
          <div className="filter-group" id="category-filters">
            {['all', 'Furniture', 'Decor', 'Lighting', 'Textiles'].map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${category === cat ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="select-wrapper">
            <select id="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="">Sort By</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && <div className="loading-spinner"></div>}

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            Error: {error}. Please try reloading the page.
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="products-grid">
            {products.map((product) => (
              <Link key={product._id} href={`/product/${product._id}`} className="product-card">
                <div className="product-image-container">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrl}
                    className="product-image"
                    alt={product.title}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://placehold.co/600x600/FAF8F5/222222?text=${encodeURIComponent(
                        product.title
                      )}`;
                    }}
                  />
                </div>
                <div className="product-info">
                  <span className="product-cat">{product.category}</span>
                  <h3 className="product-title">{product.title}</h3>
                  <span className="product-price">${product.price.toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">Ø</div>
            <h2 className="empty-state-title">No Products Found</h2>
            <p className="empty-state-desc">We couldn&apos;t find any products matching your selection.</p>
          </div>
        )}
      </main>
    </div>
  );
}
