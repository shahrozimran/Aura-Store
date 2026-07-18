'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  cacheProducts, 
  getCachedProducts, 
  queueOfflineOrder, 
  getQueuedOrders, 
  removeQueuedOrder, 
  OfflineOrder 
} from '@/lib/indexeddb';

interface Product {
  _id: string;
  title: string;
  category: string;
  price: number;
  imageUrl: string;
  stock: number;
  sku: string;
  barcode?: string;
  stockAtLocations: { locationId: string; stock: number }[];
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Customer {
  _id: string;
  username: string;
  email: string;
}

export default function POSPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();

  // POS State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  // Cart & Discount State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Network Status
  const [isOnline, setIsOnline] = useState(true);

  // POS Checkouts States
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Split'>('Card');
  const [cashAmount, setCashAmount] = useState('');
  const [cardAmount, setCardAmount] = useState('');

  // Modals States
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);

  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [closingFloat, setClosingFloat] = useState('');
  const [actualCashInDrawer, setActualCashInDrawer] = useState('');
  const [isReconciling, setIsReconciling] = useState(false);

  // Barcode buffer
  const barcodeBufferRef = useRef('');

  // Auth Guard & Register Session Verification
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?redirect=/pos');
      return;
    }

    const sId = localStorage.getItem('pos_session_id');
    const locId = localStorage.getItem('pos_location_id');
    const locName = localStorage.getItem('pos_location_name');

    if (!sId || !locId) {
      router.push('/pos/register');
    } else {
      setSessionId(sId);
      setLocationId(locId);
      setLocationName(locName);
    }
  }, [user, authLoading, router]);

  // Network Status listener
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync offline orders when connection resumes
  useEffect(() => {
    async function triggerSync() {
      if (isOnline && token) {
        try {
          const queued = await getQueuedOrders();
          if (queued.length === 0) return;

          console.log(`Syncing ${queued.length} offline orders to database...`);
          const res = await fetch('/api/pos/orders/sync-offline', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ orders: queued })
          });

          if (res.ok) {
            const data = await res.json();
            if (data.report) {
              for (const report of data.report) {
                if (report.status === 'Synced') {
                  await removeQueuedOrder(report.localId);
                }
              }
              console.log('Offline orders synced successfully.');
              loadProducts(); // Reload stock tallies
            }
          }
        } catch (err) {
          console.error('Failed to sync offline orders:', err);
        }
      }
    }
    triggerSync();
  }, [isOnline, token]);

  // Load Products & Cache
  async function loadProducts() {
    try {
      if (isOnline) {
        const res = await fetch('/api/products?category=all');
        const data = await res.json();
        if (res.ok) {
          setProducts(data);
          setFilteredProducts(data);
          await cacheProducts(data);
        }
      } else {
        const cached = await getCachedProducts();
        setProducts(cached);
        setFilteredProducts(cached);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    }
  }

  useEffect(() => {
    loadProducts();
  }, [isOnline]);

  // Load Customers list (Online accounts to merge)
  useEffect(() => {
    async function loadCustomers() {
      if (!token) return;
      try {
        // Query users list, fallback if unavailable
        const res = await fetch('/api/pos/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // We will make a mock fetch to get customers or just mock it locally
        // Let's seed a few customer profiles locally for demo/Omnichannel CRM links
        setCustomers([
          { _id: '6a5bfcca9c20f93429ece8aa', username: 'Jane Doe', email: 'jane@example.com' },
          { _id: '6a5bfcca9c20f93429ece8ab', username: 'John Smith', email: 'john@example.com' },
          { _id: '6a5bfcca9c20f93429ece8ac', username: 'Sarah Jenkins', email: 'sarah@example.com' }
        ]);
      } catch (err) {
        console.error('Customers load error:', err);
      }
    }
    loadCustomers();
  }, [token]);

  // Filter products by active filters
  useEffect(() => {
    let result = products;

    if (activeCategory !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) || 
        (p.barcode && p.barcode.includes(q))
      );
    }

    setFilteredProducts(result);
  }, [searchQuery, activeCategory, products]);

  // Keyboard listener for barcode scans (HID Keyboard mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const barcode = barcodeBufferRef.current.trim();
        barcodeBufferRef.current = '';
        if (barcode.length >= 6) {
          handleBarcodeScanned(barcode);
        }
      } else {
        // Only append numerical and text characters
        if (e.key.length === 1) {
          barcodeBufferRef.current += e.key;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products]);

  const handleBarcodeScanned = (barcode: string) => {
    const matchedProduct = products.find(p => p.barcode === barcode || p.sku === barcode);
    if (matchedProduct) {
      addToCart(matchedProduct);
    } else {
      alert(`No product matched for barcode: ${barcode}`);
    }
  };

  const addToCart = (product: Product) => {
    const storeStock = getProductStock(product);
    if (storeStock <= 0) {
      alert(`Cannot add: ${product.title} is out of stock at this location.`);
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product._id === product._id);
      if (existing) {
        if (existing.quantity >= storeStock) {
          alert(`Cannot add more. Only ${storeStock} items available in stock.`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const getProductStock = (product: Product): number => {
    if (!locationId) return 0;
    const loc = product.stockAtLocations.find(l => l.locationId.toString() === locationId.toString());
    return loc ? loc.stock : 0;
  };

  const updateCartQty = (productId: string, qty: number) => {
    const item = cart.find(i => i.product._id === productId);
    if (!item) return;

    const storeStock = getProductStock(item.product);
    if (qty > storeStock) {
      alert(`Cannot exceed store stock level of ${storeStock} units.`);
      return;
    }

    if (qty <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prev => prev.map(i => i.product._id === productId ? { ...i, quantity: qty } : i));
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.product._id !== productId));
  };

  // Cart pricing math
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = (cartSubtotal * discountPercent) / 100;
  const subtotalAfterDiscount = cartSubtotal - discountAmount;
  const tax = subtotalAfterDiscount * 0.10;
  const cartTotal = subtotalAfterDiscount + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!locationId || !sessionId) return;

    const itemsPayload = cart.map(i => ({
      product: i.product._id,
      quantity: i.quantity
    }));

    const checkoutData = {
      items: itemsPayload,
      paymentMethod,
      amountPaidCash: paymentMethod === 'Split' ? parseFloat(cashAmount || '0') : 0,
      amountPaidCard: paymentMethod === 'Split' ? parseFloat(cardAmount || '0') : 0,
      customerId: selectedCustomerId || undefined,
      locationId,
      registerSessionId: sessionId
    };

    if (paymentMethod === 'Split') {
      const sumPaid = parseFloat(cashAmount || '0') + parseFloat(cardAmount || '0');
      if (Math.abs(sumPaid - cartTotal) > 0.05) {
        alert(`Split amounts ($${sumPaid.toFixed(2)}) must exactly equal the total amount ($${cartTotal.toFixed(2)})`);
        return;
      }
    }

    try {
      if (isOnline) {
        const res = await fetch('/api/pos/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(checkoutData)
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Checkout failed');
        }

        // Show receipt
        setActiveReceipt({
          ...data,
          cashierName: user?.username || 'Cashier',
          locationName,
          localId: data._id
        });
        setShowReceiptModal(true);
      } else {
        // Offline Flow: Queue order in IndexedDB
        const localId = `off-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const offlineOrder: OfflineOrder = {
          localId,
          items: itemsPayload,
          paymentMethod,
          amountPaidCash: paymentMethod === 'Cash' ? cartTotal : (paymentMethod === 'Split' ? parseFloat(cashAmount || '0') : 0),
          amountPaidCard: paymentMethod === 'Card' ? cartTotal : (paymentMethod === 'Split' ? parseFloat(cardAmount || '0') : 0),
          customerId: selectedCustomerId || undefined,
          locationId,
          registerSessionId: sessionId,
          createdAt: new Date().toISOString()
        };

        await queueOfflineOrder(offlineOrder);

        // Update local memory catalog stock to prevent selling twice
        setProducts(prev => prev.map(p => {
          const item = cart.find(i => i.product._id === p._id);
          if (item) {
            return {
              ...p,
              stockAtLocations: p.stockAtLocations.map(l => 
                l.locationId.toString() === locationId.toString() 
                  ? { ...l, stock: l.stock - item.quantity } 
                  : l
              )
            };
          }
          return p;
        }));

        setActiveReceipt({
          items: cart.map(i => ({
            title: i.product.title,
            price: i.product.price,
            quantity: i.quantity
          })),
          totalAmount: cartTotal,
          paymentMethod,
          cashierName: user?.username || 'Cashier',
          locationName,
          localId,
          createdAt: offlineOrder.createdAt
        });
        setShowReceiptModal(true);
        alert('Connectivity is offline. Order has been queued in IndexedDB and printed locally.');
      }

      setCart([]);
      setDiscountPercent(0);
      setSelectedCustomerId('');
      setCashAmount('');
      setCardAmount('');
    } catch (err: any) {
      alert(`Error during checkout: ${err.message}`);
    }
  };

  const handleCloseRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;

    setIsReconciling(true);
    try {
      const res = await fetch('/api/pos/sessions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId,
          closingFloat: parseFloat(closingFloat),
          actualCashInDrawer: parseFloat(actualCashInDrawer)
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Reconciliation failed');
      }

      localStorage.removeItem('pos_session_id');
      localStorage.removeItem('pos_location_id');
      localStorage.removeItem('pos_location_name');

      router.push('/pos/register');
    } catch (err: any) {
      alert(`Error closing register: ${err.message}`);
      setIsReconciling(false);
    }
  };

  if (authLoading) {
    return <div className="loading-spinner" style={{ marginTop: '5rem' }}></div>;
  }

  return (
    <main style={{ maxWidth: '1400px', padding: '1.5rem' }}>
      {/* POS Top Header block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: 'var(--border-thin)', paddingBottom: '1rem' }}>
        <div>
          <h1 className="logo" style={{ fontSize: '1.4rem', display: 'inline-block', marginRight: '1.5rem' }}>
            AURA <span>POS</span>
          </h1>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginRight: '1rem' }}>
            Location: <strong>{locationName}</strong>
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Cashier: <strong>{user?.username}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: isOnline ? '#557A46' : '#A73121',
              display: 'inline-block'
            }} />
            <strong style={{ color: isOnline ? '#557A46' : '#A73121' }}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </strong>
          </div>
          <button 
            className="btn-secondary" 
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            onClick={() => setShowReconcileModal(true)}
          >
            End Shift & Close Drawer
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '2rem' }}>
        {/* Left Column: Product Selection Grid */}
        <div>
          {/* Filters controls block */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', alignItems: 'center' }}>
            <div className="search-wrapper" style={{ flex: 1, padding: '0.1rem 0.1rem 0.1rem 0.75rem' }}>
              <input
                type="text"
                placeholder="Search products by title, SKU, or barcode..."
                style={{ fontSize: '0.85rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-group" style={{ margin: 0, gap: '0.5rem' }}>
              {['all', 'Furniture', 'Decor', 'Lighting', 'Textiles'].map((cat) => (
                <button
                  key={cat}
                  className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout list */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1.5rem',
            maxHeight: 'calc(100vh - 220px)',
            overflowY: 'auto',
            paddingRight: '0.5rem'
          }}>
            {filteredProducts.map((p) => {
              const stock = getProductStock(p);
              const isOutOfStock = stock <= 0;
              return (
                <div 
                  key={p._id} 
                  className={`product-card ${isOutOfStock ? 'opacity-50' : ''}`}
                  style={{ cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                  onClick={() => !isOutOfStock && addToCart(p)}
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
                  <div className="product-info" style={{ padding: '0.75rem' }}>
                    <span className="product-cat" style={{ fontSize: '0.65rem' }}>{p.sku}</span>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 500, margin: '0.2rem 0' }}>{p.title}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <span className="product-price" style={{ fontSize: '0.9rem' }}>${p.price.toFixed(2)}</span>
                      <span style={{ fontSize: '0.75rem', color: isOutOfStock ? '#A73121' : '#557A46' }}>
                        {isOutOfStock ? 'Out of stock' : `${stock} avail`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Checkout Cart & Loyalty links */}
        <div className="white-container" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
          
          {/* CRM Loyalty customer block */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Link Loyalty Customer</label>
            <div className="select-wrapper" style={{ width: '100%' }}>
              <select
                style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="">Walk-in Customer (Anonymous)</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.username} ({c.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cart items list */}
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', borderBottom: 'var(--border-thin)' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '4rem' }}>
                <p>Cart is empty. Click catalog products or scan barcodes to begin.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div 
                  key={item.product._id} 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid rgba(34,34,34,0.03)' }}
                >
                  <div style={{ flex: 1, paddingRight: '1rem' }}>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.product.title}</h5>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ${item.product.price.toFixed(2)} each
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="cart-item-qty">
                      <button 
                        className="cart-item-qty-btn" 
                        onClick={() => updateCartQty(item.product._id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <input 
                        type="text" 
                        className="cart-item-qty-input" 
                        value={item.quantity} 
                        readOnly 
                        style={{ fontSize: '0.85rem' }}
                      />
                      <button 
                        className="cart-item-qty-btn" 
                        onClick={() => updateCartQty(item.product._id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, width: '60px', textAlign: 'right' }}>
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                    <button 
                      className="btn-remove" 
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => removeFromCart(item.product._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pricing calculations details */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <span>Subtotal</span>
              <span>${cartSubtotal.toFixed(2)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <span>Apply Discount</span>
              <select 
                style={{ border: 'var(--border-thin)', padding: '0.2rem 0.5rem', fontSize: '0.85rem' }}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(parseInt(e.target.value))}
              >
                <option value="0">No Discount</option>
                <option value="5">5% Off</option>
                <option value="10">10% Off</option>
                <option value="15">15% Off</option>
                <option value="20">20% Off</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <span>Estimated Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 600, borderTop: 'var(--border-thin)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
              <span>Total Amount</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment panels selectors */}
          <div style={{ borderTop: 'var(--border-thin)', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              {['Card', 'Cash', 'Split'].map((method) => (
                <button
                  key={method}
                  type="button"
                  className={`btn-secondary ${paymentMethod === method ? 'btn-primary' : ''}`}
                  style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem', border: 'var(--border-medium)' }}
                  onClick={() => setPaymentMethod(method as any)}
                >
                  {method}
                </button>
              ))}
            </div>

            {paymentMethod === 'Split' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Cash Paid ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    style={{ padding: '0.5rem' }}
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Card Paid ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    style={{ padding: '0.5rem' }}
                    value={cardAmount}
                    onChange={(e) => setCardAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '0.9rem' }}
              disabled={cart.length === 0}
              onClick={handleCheckout}
            >
              Complete POS Checkout
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Receipt Dialog */}
      {showReceiptModal && activeReceipt && (
        <div className="logout-overlay">
          <div className="logout-content" style={{ maxWidth: '380px', fontFamily: 'monospace', textAlign: 'left', padding: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '1px dashed #222222', paddingBottom: '1rem' }}>
              <h3 style={{ letterSpacing: '2px', fontWeight: 600 }}>AURA STORE</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{activeReceipt.locationName}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Omnichannel POS Terminal</p>
            </div>

            <div style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
              <div>Date: {new Date(activeReceipt.createdAt || Date.now()).toLocaleString()}</div>
              <div>Register Session: {sessionId?.slice(-8)}</div>
              <div>Cashier: {activeReceipt.cashierName}</div>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Tx ID: {activeReceipt.localId}</div>
            </div>

            <div style={{ borderBottom: '1px dashed #222222', paddingBottom: '0.75rem', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
              {activeReceipt.items.map((item: any, index: number) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>{item.title} (x{item.quantity})</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>TOTAL PAID</span>
                <span>${activeReceipt.totalAmount.toFixed(2)}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Payment Method: {activeReceipt.paymentMethod}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn-primary" 
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
                onClick={() => {
                  alert('Command sent: Printing receipt via local ESC/POS queue...');
                }}
              >
                Print Receipt
              </button>
              <button 
                className="btn-secondary" 
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
                onClick={() => setShowReceiptModal(false)}
              >
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Close float session Z-report dialog */}
      {showReconcileModal && (
        <div className="logout-overlay">
          <div className="logout-content" style={{ maxWidth: '420px', textAlign: 'left' }}>
            <h2 className="summary-title" style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
              Reconcile Register & Close Shift
            </h2>
            <form onSubmit={handleCloseRegister}>
              <div className="form-group">
                <label className="form-label" htmlFor="close-float">
                  Remaining Float to Leave ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="close-float"
                  className="form-control"
                  required
                  placeholder="150.00"
                  value={closingFloat}
                  onChange={(e) => setClosingFloat(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label" htmlFor="actual-cash">
                  Actual Cash In Drawer ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="actual-cash"
                  className="form-control"
                  required
                  placeholder="Drawer Cash Count"
                  value={actualCashInDrawer}
                  onChange={(e) => setActualCashInDrawer(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: '0.75rem' }}
                  disabled={isReconciling}
                >
                  {isReconciling ? 'Closing...' : 'Close Session'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ flex: 1, padding: '0.75rem' }}
                  onClick={() => setShowReconcileModal(false)}
                  disabled={isReconciling}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
