'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function POSLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  // If we are on the register page, bypass sidebar layout entirely
  if (pathname === '/pos/register') {
    return <>{children}</>;
  }

  const menuItems = [
    { name: 'Checkout', path: '/pos', icon: '🛒' },
    { name: 'Orders', path: '/pos/orders', icon: '📦' },
    { name: 'Products', path: '/pos/products', icon: '🏷️' },
    { name: 'Inventory', path: '/pos/inventory', icon: '📊' },
    { name: 'Analytics', path: '/pos/analytics', icon: '📈' },
    { name: 'Reviews', path: '/pos/reviews', icon: '⭐' }
  ];

  return (
    <div className="pos-layout-container">
      {/* Sidebar Navigation */}
      <aside className="pos-sidebar">
        <div className="pos-sidebar-header">
          <Link href="/pos" className="logo" style={{ fontSize: '1.4rem' }}>
            AURA <span>POS</span>
          </Link>
        </div>
        
        <nav className="pos-sidebar-nav">
          <ul className="pos-sidebar-menu">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.name}>
                  <Link 
                    href={item.path} 
                    className={`pos-sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <span className="pos-sidebar-icon">{item.icon}</span>
                    <span className="pos-sidebar-text">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="pos-sidebar-footer">
          <div className="pos-cashier-info">
            <div className="pos-cashier-name">{user?.username || 'Cashier'}</div>
            <div className="pos-cashier-email">{user?.email || 'cashier@aurastore.com'}</div>
          </div>
          <button onClick={() => logout()} className="btn-secondary" style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem' }}>
            Exit POS Shift
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="pos-main-content">
        {children}
      </main>
    </div>
  );
}
