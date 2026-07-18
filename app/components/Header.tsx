'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const pathname = usePathname();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  return (
    <header>
      <div className="header-container">
        <nav className="header-nav-left">
          <ul className="nav-links">
            {user && (
              <li id="nav-orders">
                <Link href="/orders" className={`nav-link ${pathname === '/orders' ? 'active' : ''}`}>
                  My Orders
                </Link>
              </li>
            )}
          </ul>
        </nav>
        
        <div className="header-logo-center">
          <Link href="/" className="logo">
            AURA <span>Store</span>
          </Link>
        </div>
        
        <div className="header-actions-right">
          <ul className="nav-links">
            {!user ? (
              <li id="nav-auth-link">
                <Link href="/auth" className={`nav-link ${pathname === '/auth' ? 'active' : ''}`}>
                  Login
                </Link>
              </li>
            ) : (
              <li id="nav-logout">
                <a href="#" className="nav-link" onClick={handleLogout}>
                  Logout
                </a>
              </li>
            )}
          </ul>
          <div className="nav-actions">
            <Link href="/cart" className="cart-icon" title="View Cart">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="cart-badge" id="cart-badge">{cartCount}</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
