import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-text">© 2026 AURA Store. All rights reserved.</div>
        <ul className="footer-links">
          <li><Link href="/">Shop</Link></li>
          <li><Link href="/privacy">Privacy Policy</Link></li>
          <li><Link href="/terms">Terms & Conditions</Link></li>
        </ul>
      </div>
    </footer>
  );
}
