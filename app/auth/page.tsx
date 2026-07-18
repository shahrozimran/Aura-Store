'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, register, loading } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // If already logged in, redirect away
  useEffect(() => {
    if (!loading && user) {
      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
    }
  }, [user, loading, router, searchParams]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!loginEmail.trim() || !loginPassword) {
      setAlert({ message: 'Please enter all fields', type: 'error' });
      return;
    }

    try {
      await login(loginEmail.trim(), loginPassword);
      setAlert({ message: 'Login successful! Redirecting...', type: 'success' });
      
      setTimeout(() => {
        const redirect = searchParams.get('redirect') || '/';
        router.push(redirect);
      }, 1000);
    } catch (err: any) {
      setAlert({ message: err.message || 'Login failed. Please check credentials.', type: 'error' });
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!registerUsername.trim() || !registerEmail.trim() || !registerPassword) {
      setAlert({ message: 'Please enter all fields', type: 'error' });
      return;
    }

    if (registerPassword.length < 6) {
      setAlert({ message: 'Password must be at least 6 characters long', type: 'error' });
      return;
    }

    try {
      await register(registerUsername.trim(), registerEmail.trim(), registerPassword);
      setAlert({ message: 'Registration successful! Redirecting...', type: 'success' });

      setTimeout(() => {
        const redirect = searchParams.get('redirect') || '/';
        router.push(redirect);
      }, 1000);
    } catch (err: any) {
      setAlert({ message: err.message || 'Registration failed.', type: 'error' });
    }
  };

  if (loading) {
    return <div className="loading-spinner" style={{ marginTop: '5rem' }}></div>;
  }

  return (
    <div className="auth-container white-container">
      {/* Tab Selection */}
      <div className="auth-tabs">
        <button
          className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('login');
            setAlert(null);
          }}
        >
          Login
        </button>
        <button
          className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('register');
            setAlert(null);
          }}
        >
          Register
        </button>
      </div>

      {/* Alert Notifications */}
      {alert && (
        <div className={`alert alert-${alert.type}`} style={{ marginBottom: '1.5rem' }}>
          {alert.message}
        </div>
      )}

      {/* Login Form */}
      {activeTab === 'login' && (
        <form id="login-form" onSubmit={handleLoginSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email Address
            </label>
            <input
              type="email"
              id="login-email"
              className="form-control"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <input
              type="password"
              id="login-password"
              className="form-control"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Log In
          </button>
        </form>
      )}

      {/* Register Form */}
      {activeTab === 'register' && (
        <form id="register-form" onSubmit={handleRegisterSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-username">
              Username
            </label>
            <input
              type="text"
              id="register-username"
              className="form-control"
              required
              minLength={3}
              value={registerUsername}
              onChange={(e) => setRegisterUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="register-email">
              Email Address
            </label>
            <input
              type="email"
              id="register-email"
              className="form-control"
              required
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label" htmlFor="register-password">
              Password
            </label>
            <input
              type="password"
              id="register-password"
              className="form-control"
              required
              minLength={6}
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Create Account
          </button>
        </form>
      )}
    </div>
  );
}

export default function AuthPage() {
  return (
    <main>
      <Suspense fallback={<div className="loading-spinner" style={{ marginTop: '5rem' }}></div>}>
        <AuthForm />
      </Suspense>
    </main>
  );
}
