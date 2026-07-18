'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LogoutOverlay() {
  const { isLoggingOut } = useAuth();

  if (!isLoggingOut) return null;

  return (
    <div className="logout-overlay">
      <div className="logout-content">
        <div className="logo" style={{ marginBottom: '1rem', fontSize: '2rem' }}>
          AURA <span>Store</span>
        </div>
        <div className="loading-spinner" style={{ margin: '1rem auto' }}></div>
        <p className="logout-text">Logging out of your session...</p>
      </div>
    </div>
  );
}
