import React from 'react';

export const metadata = {
  title: 'Privacy Policy - AURA Store',
};

export default function PrivacyPage() {
  return (
    <main>
      <h1 className="page-title">Privacy Policy</h1>
      
      <div className="white-container legal-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <p style={{ fontStyle: 'italic', marginBottom: '2rem' }}>Last Updated: July 15, 2026</p>

        <p>At AURA Store, we respect your privacy and are committed to protecting the personal data you share with us. This Privacy Policy describes how we collect, use, and protect your information when you visit and purchase from our store.</p>

        <h2 style={{ fontWeight: 400, fontSize: '1.4rem', margin: '2rem 0 1rem 0', letterSpacing: '-0.01em' }}>
          1. Information We Collect
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
          We collect information to provide a better shopping experience and process your orders safely. The types of data collected include:
        </p>
        <ul style={{ listStyleType: 'square', marginLeft: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Account Information:</strong> Your username, email address, and encrypted password when you register.
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Transaction & Shipping Data:</strong> Shipping address, recipient name, contact details, and records of products purchased.
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <strong>Session & Cart State:</strong> Browser storage records (localStorage) containing token logs and item lists in your shopping cart.
          </li>
        </ul>

        <h2 style={{ fontWeight: 400, fontSize: '1.4rem', margin: '2rem 0 1rem 0', letterSpacing: '-0.01em' }}>
          2. How We Use Your Information
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
          Your details are used strictly for service fulfillment and operational maintenance, including:
        </p>
        <ul style={{ listStyleType: 'square', marginLeft: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Processing, verifying, and shipping your orders.</li>
          <li style={{ marginBottom: '0.5rem' }}>Authenticating your account login sessions.</li>
          <li style={{ marginBottom: '0.5rem' }}>Analyzing store performance to improve search navigation and page responsiveness.</li>
        </ul>

        <h2 style={{ fontWeight: 400, fontSize: '1.4rem', margin: '2rem 0 1rem 0', letterSpacing: '-0.01em' }}>
          3. Data Storage & Security
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
          We prioritize the safety of your information. Passwords are securely hashed using industry-standard bcrypt encryption before storage. Since we use a dynamic in-memory database system for development, mock orders and test profiles are isolated and reset periodically to maintain clean test environments.
        </p>

        <h2 style={{ fontWeight: 400, fontSize: '1.4rem', margin: '2rem 0 1rem 0', letterSpacing: '-0.01em' }}>
          4. Sharing with Third Parties
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
          We do **not** sell, rent, or trade your personal information. Data is shared with external partners only when necessary to process fulfillment operations (such as forwarding shipping details to delivery carriers).
        </p>

        <h2 style={{ fontWeight: 400, fontSize: '1.4rem', margin: '2rem 0 1rem 0', letterSpacing: '-0.01em' }}>
          5. Cookies & Browser Storage
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
          We use standard HTML5 LocalStorage to hold your login credentials (JWT tokens) and shopping cart items. This information is stored client-side in your own browser and can be cleared at any time by logging out or emptying your browser cache.
        </p>

        <h2 style={{ fontWeight: 400, fontSize: '1.4rem', margin: '2rem 0 1rem 0', letterSpacing: '-0.01em' }}>
          6. Contact Us
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
          If you have any questions or feedback regarding this Privacy Policy, please reach out to us at: <strong>privacy@aurastore.com</strong>
        </p>
      </div>
    </main>
  );
}
