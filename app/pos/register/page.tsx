'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface Location {
  _id: string;
  name: string;
  address?: {
    addressLine1?: string;
    city?: string;
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();

  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [openingFloat, setOpeningFloat] = useState('150.00');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth Protection Check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?redirect=/pos/register');
    }
  }, [user, authLoading, router]);

  // Check if session is already open
  useEffect(() => {
    async function checkSession() {
      if (!token) return;
      try {
        const res = await fetch('/api/pos/sessions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.activeSession) {
          // Store session details in localStorage for client-side POS referencing
          localStorage.setItem('pos_session_id', data.activeSession._id);
          localStorage.setItem('pos_location_id', data.activeSession.locationId._id);
          localStorage.setItem('pos_location_name', data.activeSession.locationId.name);
          router.push('/pos');
        } else {
          setLocations(data.locations || []);
          if (data.locations && data.locations.length > 0) {
            setSelectedLocation(data.locations[0]._id);
          }
        }
      } catch (err: any) {
        setError('Failed to load register sessions');
      } finally {
        setLoading(false);
      }
    }
    if (token) {
      checkSession();
    }
  }, [token, router]);

  const handleOpenRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation || !openingFloat) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/pos/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          locationId: selectedLocation,
          openingFloat: parseFloat(openingFloat)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to open register');
      }

      localStorage.setItem('pos_session_id', data._id);
      localStorage.setItem('pos_location_id', data.locationId._id);
      localStorage.setItem('pos_location_name', data.locationId.name);

      router.push('/pos');
    } catch (err: any) {
      setError(err.message || 'Failed to open register session');
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="loading-spinner" style={{ marginTop: '5rem' }}></div>;
  }

  return (
    <main style={{ maxWidth: '480px', margin: '3rem auto' }}>
      <div className="white-container" style={{ padding: '3rem 2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 className="logo" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            AURA <span>Register</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Establish a starting float balance to open your register shift.
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleOpenRegister}>
          {/* Location Select Dropdown */}
          <div className="form-group">
            <label className="form-label" htmlFor="location-select">
              Select Store Location
            </label>
            <div className="select-wrapper" style={{ width: '100%' }}>
              <select
                id="location-select"
                style={{ width: '100%', border: 'var(--border-thin)', padding: '0.85rem 1rem' }}
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                required
              >
                {locations.map((loc) => (
                  <option key={loc._id} value={loc._id}>
                    {loc.name} {loc.address?.city ? `(${loc.address.city})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Opening Float Input */}
          <div className="form-group" style={{ marginBottom: '2.5rem' }}>
            <label className="form-label" htmlFor="float-amount">
              Opening Cash Float ($)
            </label>
            <input
              type="number"
              step="0.01"
              id="float-amount"
              className="form-control"
              placeholder="150.00"
              required
              value={openingFloat}
              onChange={(e) => setOpeningFloat(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Open Register Shift
          </button>
        </form>
      </div>
    </main>
  );
}
