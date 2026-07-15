// Cart state management functions
function getCart() {
  try {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error parsing cart from localStorage:', error);
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId, quantity, title, price, imageUrl, maxStock) {
  const cart = getCart();
  const existingItemIndex = cart.findIndex(item => item.product === productId);
  
  if (existingItemIndex > -1) {
    const newQty = cart[existingItemIndex].quantity + quantity;
    if (newQty > maxStock) {
      alert(`Cannot add more. Only ${maxStock} items available in stock.`);
      return false;
    }
    cart[existingItemIndex].quantity = newQty;
  } else {
    if (quantity > maxStock) {
      alert(`Cannot add. Only ${maxStock} items available in stock.`);
      return false;
    }
    cart.push({
      product: productId,
      quantity: quantity,
      title,
      price,
      imageUrl,
      maxStock
    });
  }
  
  saveCart(cart);
  return true;
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.product !== productId);
  saveCart(cart);
}

function updateCartQuantity(productId, quantity, maxStock) {
  const cart = getCart();
  const item = cart.find(item => item.product === productId);
  
  if (item) {
    if (quantity > maxStock) {
      alert(`Only ${maxStock} items available in stock.`);
      return false;
    }
    item.quantity = quantity;
    saveCart(cart);
    return true;
  }
  return false;
}

function clearCart() {
  localStorage.removeItem('cart');
  updateCartBadge();
}

function getCartCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.textContent = getCartCount();
  }
}

// Authentication Helpers
function isLoggedIn() {
  return localStorage.getItem('token') !== null;
}

function getCurrentUser() {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    return null;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// Attach logout to window so inline onclick handlers can access it
window.logout = logout;

// Common UI Initialization
function initializeCommonUI() {
  // Inject Header Content
  const header = document.querySelector('header');
  if (header) {
    const user = getCurrentUser();
    header.innerHTML = `
      <div class="header-container">
        <a href="index.html" class="logo">AURA <span>Store</span></a>
        <nav>
          <ul class="nav-links">
            <li><a href="index.html" class="nav-link" data-page="shop">Shop</a></li>
            <li id="nav-orders" class="${isLoggedIn() ? '' : 'hidden'}">
              <a href="orders.html" class="nav-link" data-page="orders">My Orders</a>
            </li>
            <li id="nav-auth-link" class="${isLoggedIn() ? 'hidden' : ''}">
              <a href="auth.html" class="nav-link" data-page="auth">Login</a>
            </li>
            <li id="nav-logout" class="${isLoggedIn() ? '' : 'hidden'}">
              <a href="#" class="nav-link" id="logout-btn">Logout</a>
            </li>
          </ul>
        </nav>
        <div class="nav-actions">
          <a href="cart.html" class="cart-icon" title="View Cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <span class="cart-badge" id="cart-badge">0</span>
          </a>
        </div>
      </div>
    `;

    // Add event listener to the dynamically created logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
    }

    // Set active link class based on current page
    const currentPage = header.getAttribute('data-active-page');
    if (currentPage) {
      const activeLink = header.querySelector(`[data-page="${currentPage}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
      }
    }
  }

  // Inject Footer Content
  const footer = document.querySelector('footer');
  if (footer) {
    footer.innerHTML = `
      <div class="footer-container">
        <div class="footer-text">© 2026 AURA Store. All rights reserved.</div>
        <ul class="footer-links">
          <li><a href="index.html">Shop</a></li>
          <li><a href="privacy.html">Privacy Policy</a></li>
          <li><a href="terms.html">Terms & Conditions</a></li>
        </ul>
      </div>
    `;
  }

  // Hide elements based on auth state (fallback selector check)
  const loggedInOnly = document.querySelectorAll('.logged-in-only');
  const loggedOutOnly = document.querySelectorAll('.logged-out-only');

  if (isLoggedIn()) {
    loggedInOnly.forEach(el => el.classList.remove('hidden'));
    loggedOutOnly.forEach(el => el.classList.add('hidden'));
  } else {
    loggedInOnly.forEach(el => el.classList.add('hidden'));
    loggedOutOnly.forEach(el => el.classList.remove('hidden'));
  }

  // Add styles to hide elements if not already in style.css
  if (!document.getElementById('core-utility-styles')) {
    const style = document.createElement('style');
    style.id = 'core-utility-styles';
    style.textContent = '.hidden { display: none !important; }';
    document.head.appendChild(style);
  }

  updateCartBadge();
}

// Run UI construction when DOM loads
document.addEventListener('DOMContentLoaded', initializeCommonUI);
