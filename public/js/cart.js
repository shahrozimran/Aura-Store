document.addEventListener('DOMContentLoaded', () => {
  const cartLayout = document.getElementById('cart-layout');
  const cartEmpty = document.getElementById('cart-empty');
  const cartItemsContainer = document.getElementById('cart-items');
  const subtotalEl = document.getElementById('cart-subtotal');
  const taxEl = document.getElementById('cart-tax');
  const totalEl = document.getElementById('cart-total');
  const btnCheckout = document.getElementById('btn-checkout');

  renderCart();

  function renderCart() {
    const cart = getCart();

    if (cart.length === 0) {
      cartLayout.classList.add('hidden');
      cartEmpty.classList.remove('hidden');
      return;
    }

    cartEmpty.classList.add('hidden');
    cartItemsContainer.innerHTML = '';
    
    let subtotal = 0;

    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      const itemRow = document.createElement('div');
      itemRow.className = 'cart-item';
      itemRow.innerHTML = `
        <img src="${item.imageUrl}" class="cart-item-img" alt="${item.title}" onerror="this.onerror=null; this.src='https://placehold.co/120x120/FAF8F5/222222?text=${encodeURIComponent(item.title)}'">
        <div class="cart-item-details">
          <h3 class="cart-item-title">${item.title}</h3>
          <p class="cart-item-category">Category</p>
          <div class="cart-item-price">$${item.price.toFixed(2)}</div>
        </div>
        <div class="cart-item-controls">
          <div class="cart-item-qty">
            <button class="cart-item-qty-btn btn-decrease" data-id="${item.product}">-</button>
            <input type="text" class="cart-item-qty-input" value="${item.quantity}" readonly>
            <button class="cart-item-qty-btn btn-increase" data-id="${item.product}">+</button>
          </div>
          <button class="btn-remove" data-id="${item.product}">Remove</button>
        </div>
      `;

      // Hook up increase/decrease handlers
      itemRow.querySelector('.btn-decrease').addEventListener('click', () => {
        if (item.quantity > 1) {
          updateCartQuantity(item.product, item.quantity - 1, item.maxStock);
          renderCart();
        }
      });

      itemRow.querySelector('.btn-increase').addEventListener('click', () => {
        if (item.quantity < item.maxStock) {
          updateCartQuantity(item.product, item.quantity + 1, item.maxStock);
          renderCart();
        } else {
          alert(`Only ${item.maxStock} units of this item are available in stock.`);
        }
      });

      // Hook up remove handler
      itemRow.querySelector('.btn-remove').addEventListener('click', () => {
        removeFromCart(item.product);
        renderCart();
      });

      cartItemsContainer.appendChild(itemRow);
    });

    // Update Summary totals
    const tax = subtotal * 0.10;
    const total = subtotal + tax;

    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    taxEl.textContent = `$${tax.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;

    cartLayout.classList.remove('hidden');
  }

  // Handle Checkout Click
  btnCheckout.addEventListener('click', () => {
    if (isLoggedIn()) {
      window.location.href = 'checkout.html';
    } else {
      // Redirect to login first, then proceed to checkout after successful login
      window.location.href = 'auth.html?redirect=checkout.html';
    }
  });
});
