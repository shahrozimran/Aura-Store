'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface Product {
  _id: string;
  title: string;
  category: string;
  price: number;
  imageUrl: string;
  stock: number;
  sku: string;
  barcode?: string;
  description: string;
  features: string[];
}

export default function POSProductsPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formCategory, setFormCategory] = useState('Furniture');
  const [formStock, setFormStock] = useState('10');
  const [formDescription, setFormDescription] = useState('');
  const [formFeatures, setFormFeatures] = useState('');

  // Auth Protection Check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?redirect=/pos/products');
    }
  }, [user, authLoading, router]);

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await fetch('/api/products?category=all');
      const data = await res.json();
      if (res.ok) {
        setProducts(data);
        setFilteredProducts(data);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // Filter Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
    } else {
      const q = searchQuery.toLowerCase().trim();
      setFilteredProducts(
        products.filter(p => 
          p.title.toLowerCase().includes(q) || 
          p.sku.toLowerCase().includes(q) || 
          (p.barcode && p.barcode.includes(q))
        )
      );
    }
  }, [searchQuery, products]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormTitle('');
    setFormSku('');
    setFormBarcode('');
    setFormPrice('');
    setFormImageUrl('');
    setFormCategory('Furniture');
    setFormStock('10');
    setFormDescription('');
    setFormFeatures('');
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormTitle(product.title);
    setFormSku(product.sku);
    setFormBarcode(product.barcode || '');
    setFormPrice(product.price.toString());
    setFormImageUrl(product.imageUrl);
    setFormCategory(product.category);
    setFormStock(product.stock.toString());
    setFormDescription(product.description);
    setFormFeatures(product.features.join(', '));
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const featuresArray = formFeatures.split(',').map(f => f.trim()).filter(Boolean);

    const payload = {
      title: formTitle,
      sku: formSku,
      barcode: formBarcode || undefined,
      price: parseFloat(formPrice),
      imageUrl: formImageUrl,
      category: formCategory,
      stock: parseInt(formStock),
      description: formDescription,
      features: featuresArray
    };

    try {
      let res;
      if (editingProduct) {
        // Edit flow
        res = await fetch(`/api/pos/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Create flow
        res = await fetch('/api/pos/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Action failed');
      }

      setShowModal(false);
      loadProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (authLoading || loading) {
    return <div className="loading-spinner" style={{ marginTop: '5rem' }}></div>;
  }

  return (
    <div>
      {/* Header and Add button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 500 }}>Products Catalog</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Register new minimalist items, assign unique barcodes, and update prices or specifications.
          </p>
        </div>

        <button className="btn-primary" onClick={openCreateModal}>
          + Add New Product
        </button>
      </div>

      {/* Search Input bar */}
      <div className="search-wrapper" style={{ maxWidth: '400px', marginBottom: '1.5rem', padding: '0.1rem 0.1rem 0.1rem 0.75rem' }}>
        <input
          type="text"
          placeholder="Search products by title, SKU, or barcode..."
          style={{ fontSize: '0.85rem' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Products list grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '2rem'
      }}>
        {filteredProducts.map((p) => (
          <div 
            key={p._id} 
            className="product-card"
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <div className="product-image-container">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.imageUrl}
                alt={p.title}
                className="product-image"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = `https://placehold.co/300x300?text=${encodeURIComponent(p.title)}`;
                }}
              />
            </div>
            <div className="product-info" style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem' }}>
                <span className="product-cat" style={{ margin: 0 }}>{p.sku}</span>
                <span style={{ color: 'var(--text-muted)' }}>{p.category}</span>
              </div>
              
              <h4 style={{ fontSize: '0.95rem', fontWeight: 500, margin: '0.35rem 0' }}>{p.title}</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1rem', height: '2.1rem' }}>
                {p.description}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid rgba(34,34,34,0.03)', paddingTop: '0.75rem' }}>
                <span className="product-price" style={{ fontSize: '1rem' }}>${p.price.toFixed(2)}</span>
                <button
                  className="btn-secondary"
                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                  onClick={() => openEditModal(p)}
                >
                  Edit Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Create/Edit Modal Form */}
      {showModal && (
        <div className="logout-overlay">
          <div className="logout-content" style={{ maxWidth: '600px', width: '90%', textAlign: 'left', padding: '2.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: 'var(--border-thin)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                {editingProduct ? 'Edit Catalog Product' : 'Register New Catalog Product'}
              </h3>
              <button 
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Row 1: Title & Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="form-title">Product Title</label>
                  <input
                    type="text"
                    id="form-title"
                    className="form-control"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="form-category">Category</label>
                  <div className="select-wrapper">
                    <select
                      id="form-category"
                      style={{ width: '100%', padding: '0.85rem 1rem', border: 'var(--border-thin)' }}
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                    >
                      <option value="Furniture">Furniture</option>
                      <option value="Decor">Decor</option>
                      <option value="Lighting">Lighting</option>
                      <option value="Textiles">Textiles</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 2: SKU & Barcode */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="form-sku">Stock Keeping Unit (SKU)</label>
                  <input
                    type="text"
                    id="form-sku"
                    className="form-control"
                    placeholder="e.g. AUR-DECO-41"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="form-barcode">Barcode Number (UPC)</label>
                  <input
                    type="text"
                    id="form-barcode"
                    className="form-control"
                    placeholder="e.g. 750102030041"
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 3: Price & Base Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="form-price">Base Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    id="form-price"
                    className="form-control"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="form-stock">Base Warehouse Stock</label>
                  <input
                    type="number"
                    id="form-stock"
                    className="form-control"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                  />
                </div>
              </div>

              {/* Image URL */}
              <div className="form-group">
                <label className="form-label" htmlFor="form-image">Product Image Link</label>
                <input
                  type="url"
                  id="form-image"
                  className="form-control"
                  placeholder="https://images.unsplash.com/..."
                  required
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label" htmlFor="form-description">Description</label>
                <textarea
                  id="form-description"
                  className="form-control"
                  style={{ minHeight: '80px', fontFamily: 'inherit', padding: '0.85rem' }}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              {/* Features (Specification Details) */}
              <div className="form-group">
                <label className="form-label" htmlFor="form-features">Specifications / Features (Comma Separated)</label>
                <input
                  type="text"
                  id="form-features"
                  className="form-control"
                  placeholder="e.g. Solid ash framing, Matte finish, Dimensions: 50x50cm"
                  value={formFeatures}
                  onChange={(e) => setFormFeatures(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.75rem' }}>
                  {editingProduct ? 'Save Modifications' : 'Create Product'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  style={{ flex: 1, padding: '0.75rem' }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
