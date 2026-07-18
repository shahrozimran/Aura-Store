import React from 'react';

export const metadata = {
  title: 'Terms & Conditions - AURA Store',
};

export default function TermsPage() {
  return (
    <main>
      <h1 className="page-title">Terms & Conditions</h1>
      
      <div className="white-container legal-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <p style={{ fontStyle: 'italic', marginBottom: '2rem' }}>Last Updated: July 15, 2026</p>

        <p>Welcome to AURA Store. By using our website and purchasing our products, you agree to comply with and be bound by the following Terms and Conditions. Please review them carefully.</p>

        <h2 style={{ fontWeight: 400, fontSize: '1.4rem', margin: '2rem 0 1rem 0', letterSpacing: '-0.01em' }}>
          1. Account Security
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
          When you create an account, you are responsible for maintaining the confidentiality of your username and password, as well as restricting access to your computer. You agree to accept responsibility for all activities that occur under your account.
        </p>

        <h2 style={{ fontWeight: 400, fontSize: '1.4rem', margin: '2rem 0 1rem 0', letterSpacing: '-0.01em' }}>
          2. Products & Pricing
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
          We strive to display our home objects (including furniture, decor, lighting, and textiles) as accurately as possible. However:
        </p>
        <ul style={{ listStyleType: 'square', marginLeft: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>We do not warrant that product descriptions or colors are 100% error-free.</li>
          <li style={{ marginBottom: '0.5rem' }}>All prices are listed in USD and are subject to change without notice.</li>
          <li style={{ marginBottom: '0.5rem' }}>Stock levels listed are dynamic. In-stock products are sold on a first-come, first-served basis.</li>
        </ul>

        <h2 style={{ fontWeight: 400, fontSize: '1.4rem', margin: '2rem 0 1rem 0', letterSpacing: '-0.01em' }}>
          3. Order Processing & Acceptance
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
          Your receipt of an order confirmation does not signify our acceptance of your order. We reserve the right at any time after receipt of your order to accept or decline it. If an item runs out of stock before processing is complete, we will reject the transaction and adjust remaining quantities accordingly.
        </p>

        <h2 style={{ fontWeight: 400, fontSize: '1.4rem', margin: '2rem 0 1rem 0', letterSpacing: '-0.01em' }}>
          4. Shipping & Returns
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
          Currently, shipping is provided free of charge for all curated objects. Shipping address details must be complete and accurate. AURA Store is not responsible for lost packages due to incorrect delivery addresses submitted at checkout.
        </p>

        <h2 style={{ fontWeight: 400, fontSize: '1.4rem', margin: '2rem 0 1rem 0', letterSpacing: '-0.01em' }}>
          5. Intellectual Property
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
          All content included on this site, such as designs, product images, graphics, logos, button icons, and code scripts, is the property of AURA Store or its content suppliers and is protected by international copyright and trademark laws.
        </p>

        <h2 style={{ fontWeight: 400, fontSize: '1.4rem', margin: '2rem 0 1rem 0', letterSpacing: '-0.01em' }}>
          6. Limitation of Liability
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
          AURA Store shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the site or products purchased through it.
        </p>

        <h2 style={{ fontWeight: 400, fontSize: '1.4rem', margin: '2rem 0 1rem 0', letterSpacing: '-0.01em' }}>
          7. Contact Information
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
          For questions or clarifications regarding these Terms and Conditions, please contact us at: <strong>support@aurastore.com</strong>
        </p>
      </div>
    </main>
  );
}
