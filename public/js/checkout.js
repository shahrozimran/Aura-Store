document.addEventListener('DOMContentLoaded', () => {
  // Authentication check
  if (!isLoggedIn()) {
    window.location.href = 'auth.html?redirect=checkout.html';
    return;
  }

  // Cart empty check
  const cart = getCart();
  if (cart.length === 0) {
    window.location.href = 'cart.html';
    return;
  }

  const itemsListEl = document.getElementById('checkout-items-list');
  const subtotalEl = document.getElementById('review-subtotal');
  const taxEl = document.getElementById('review-tax');
  const totalEl = document.getElementById('review-total');
  
  const checkoutForm = document.getElementById('checkout-form');
  const btnTriggerCheckout = document.getElementById('btn-trigger-checkout');
  const alertBox = document.getElementById('checkout-alert');

  // Render review order items
  renderOrderReview();

  function renderOrderReview() {
    itemsListEl.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      const reviewRow = document.createElement('div');
      reviewRow.className = 'summary-row';
      reviewRow.style.fontSize = '0.9rem';
      reviewRow.style.marginBottom = '0.75rem';
      reviewRow.innerHTML = `
        <span style="color: var(--text-muted);">${item.title} (x${item.quantity})</span>
        <span>$${itemTotal.toFixed(2)}</span>
      `;
      itemsListEl.appendChild(reviewRow);
    });

    const tax = subtotal * 0.10;
    const total = subtotal + tax;

    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    taxEl.textContent = `$${tax.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;
  }

  // Helper alerts
  function showAlert(msg, type = 'error') {
    alertBox.textContent = msg;
    alertBox.className = `alert alert-${type}`;
    alertBox.scrollIntoView({ behavior: 'smooth' });
  }

  function clearAlert() {
    alertBox.textContent = '';
    alertBox.className = 'alert hidden';
  }

  // Form submission click trigger
  btnTriggerCheckout.addEventListener('click', () => {
    // Manually trigger html validation and submit the form
    checkoutForm.requestSubmit();
  });

  // Handle Form Submission
  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAlert();
    
    // Disable button to prevent double submit
    btnTriggerCheckout.disabled = true;
    btnTriggerCheckout.textContent = 'Processing...';

    // Collect shipping details
    const shippingAddress = {
      fullName: document.getElementById('ship-name').value.trim(),
      addressLine1: document.getElementById('ship-address').value.trim(),
      city: document.getElementById('ship-city').value.trim(),
      postalCode: document.getElementById('ship-zip').value.trim(),
      country: document.getElementById('ship-country').value.trim()
    };

    // Map cart items for backend schema
    const orderItems = cart.map(item => ({
      product: item.product,
      quantity: item.quantity
    }));

    try {
      const responseOrder = await api.createOrder(orderItems, shippingAddress);
      
      showAlert('Order placed successfully! Redirecting...', 'success');
      
      // Clear cart storage
      clearCart();

      // Redirect to orders page after short timeout
      setTimeout(() => {
        window.location.href = 'orders.html';
      }, 1500);
    } catch (error) {
      btnTriggerCheckout.disabled = false;
      btnTriggerCheckout.textContent = 'Complete Order';
      showAlert(error.message);
    }
  });
});
