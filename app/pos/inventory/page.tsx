'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface Location {
  _id: string;
  name: string;
  type: string;
}

interface Product {
  _id: string;
  title: string;
  sku: string;
  stock: number;
  stockAtLocations: { locationId: string; stock: number }[];
}

export default function POSInventoryPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editedStocks, setEditedStocks] = useState<{ [locationId: string]: number }>({});

  // Auth Protection Check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?redirect=/pos/inventory');
    }
  }, [user, authLoading, router]);

  async function loadData() {
    if (!token) return;
    setLoading(true);
    try {
      const [locRes, prodRes] = await Promise.all([
        fetch('/api/pos/locations', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/products?category=all')
      ]);

      const locs = await locRes.json();
      const prods = await prodRes.json();

      if (locRes.ok && prodRes.ok) {
        setLocations(locs);
        setProducts(prods);
      }
    } catch (err) {
      console.error('Error loading inventory data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const getStockForLocation = (product: Product, locationId: string): number => {
    const record = product.stockAtLocations.find(l => l.locationId.toString() === locationId.toString());
    return record ? record.stock : 0;
  };

  const startEditing = (product: Product) => {
    setEditingRowId(product._id);
    const initialStocks: { [locationId: string]: number } = {};
    locations.forEach(loc => {
      initialStocks[loc._id] = getStockForLocation(product, loc._id);
    });
    setEditedStocks(initialStocks);
  };

  const handleStockChange = (locationId: string, val: number) => {
    setEditedStocks(prev => ({
      ...prev,
      [locationId]: Math.max(0, val)
    }));
  };

  const handleSave = async (productId: string) => {
    const updatedStockAtLocations = Object.entries(editedStocks).map(([locationId, stock]) => ({
      locationId,
      stock
    }));

    // Calculate total stock as sum of warehouse + store
    const newTotalStock = updatedStockAtLocations.reduce((sum, item) => sum + item.stock, 0);

    try {
      const res = await fetch(`/api/pos/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          stockAtLocations: updatedStockAtLocations,
          stock: newTotalStock
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update stock levels');
      }

      setEditingRowId(null);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (authLoading || loading) {
    return <div className="loading-spinner" style={{ marginTop: '5rem' }}></div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 500 }}>Multi-Location Inventory</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Compare and adjust inventory counts across your Central Warehouse and Retail Stores.
        </p>
      </div>

      {/* Inventory Table */}
      <div className="white-container" style={{ padding: '0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: 'var(--border-thin)', backgroundColor: 'rgba(245,242,235,0.4)' }}>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Product Title</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>SKU</th>
              {locations.map(loc => (
                <th key={loc._id} style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  {loc.name} {loc.type === 'Warehouse' ? '🏢' : '🏪'}
                </th>
              ))}
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Total Global Stock</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const isEditing = editingRowId === p._id;
              return (
                <tr key={p._id} style={{ borderBottom: '1px solid rgba(34,34,34,0.05)' }}>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
                    {p.title}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                    {p.sku}
                  </td>
                  
                  {/* Location stock columns */}
                  {locations.map(loc => {
                    const stock = isEditing ? editedStocks[loc._id] : getStockForLocation(p, loc._id);
                    return (
                      <td key={loc._id} style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                              type="button"
                              className="cart-item-qty-btn"
                              style={{ width: '24px', height: '24px' }}
                              onClick={() => handleStockChange(loc._id, (editedStocks[loc._id] || 0) - 1)}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              style={{ width: '50px', padding: '0.2rem', textAlign: 'center', border: 'var(--border-thin)' }}
                              value={stock}
                              onChange={(e) => handleStockChange(loc._id, parseInt(e.target.value) || 0)}
                            />
                            <button
                              type="button"
                              className="cart-item-qty-btn"
                              style={{ width: '24px', height: '24px' }}
                              onClick={() => handleStockChange(loc._id, (editedStocks[loc._id] || 0) + 1)}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontWeight: 500, color: stock === 0 ? '#A73121' : 'inherit' }}>
                            {stock}
                          </span>
                        )}
                      </td>
                    );
                  })}

                  {/* Total Stock */}
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                    {isEditing ? Object.values(editedStocks).reduce((a, b) => a + b, 0) : p.stock}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.85rem' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn-primary"
                          style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={() => handleSave(p._id)}
                        >
                          Save
                        </button>
                        <button
                          className="btn-secondary"
                          style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={() => setEditingRowId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn-secondary"
                        style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                        onClick={() => startEditing(p)}
                      >
                        Adjust stock
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
