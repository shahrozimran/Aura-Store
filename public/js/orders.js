document.addEventListener('DOMContentLoaded', async () => {
  // Auth Check
  if (!isLoggedIn()) {
    window.location.href = 'auth.html?redirect=orders.html';
    return;
  }

  const loadingEl = document.getElementById('orders-loading');
  const errorEl = document.getElementById('orders-error');
  const listEl = document.getElementById('orders-list');
  const emptyEl = document.getElementById('orders-empty');

  try {
    const orders = await api.getOrders();
    renderOrders(orders);
  } catch (error) {
    showError(error.message);
  }

  function showError(msg) {
    loadingEl.classList.add('hidden');
    listEl.classList.add('hidden');
    emptyEl.classList.add('hidden');
    errorEl.textContent = `Error: ${msg}`;
    errorEl.classList.remove('hidden');
  }

  function renderOrders(orders) {
    loadingEl.classList.add('hidden');
    errorEl.classList.add('hidden');
    listEl.innerHTML = '';

    if (orders.length === 0) {
      listEl.classList.add('hidden');
      emptyEl.classList.remove('hidden');
      return;
    }

    orders.forEach(order => {
      const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const orderCard = document.createElement('div');
      orderCard.className = 'order-card';
      
      // Items HTML
      let itemsHtml = '';
      order.items.forEach(item => {
        // Use snapshotted title/imageUrl with fallback to product object if missing on old records
        const rawTitle = item.title || (item.product ? item.product.title : 'Deleted Product');
        const title = escapeHTML(rawTitle);
        const imgUrl = item.imageUrl || (item.product ? item.product.imageUrl : 'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=600&auto=format&fit=crop');
        
        // Wrap title in a link back to the product detail page if the product exists in the catalog
        const linkStart = item.product ? `<a href="product.html?id=${item.product._id || item.product}" style="color: inherit; text-decoration: none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">` : '';
        const linkEnd = item.product ? '</a>' : '';

        itemsHtml += `
          <div class="order-item-row">
            <div class="order-item-info">
              <img src="${imgUrl}" class="order-item-img" alt="${title}" onerror="this.onerror=null; this.src='https://placehold.co/100x100/FAF8F5/222222?text=${encodeURIComponent(title)}'">
              <div>
                <div class="order-item-title">${linkStart}${title}${linkEnd}</div>
                <div class="order-item-qty-price">Qty: ${item.quantity} × $${item.price.toFixed(2)}</div>
              </div>
            </div>
            <div style="font-weight: 500;">$${(item.price * item.quantity).toFixed(2)}</div>
          </div>
        `;
      });

      const statusClass = `status-${order.status.toLowerCase()}`;
      
      const orderId = escapeHTML(order._id);
      const shipName = escapeHTML(order.shippingAddress.fullName);
      const shipAddr1 = escapeHTML(order.shippingAddress.addressLine1);
      const shipCity = escapeHTML(order.shippingAddress.city);
      const shipZip = escapeHTML(order.shippingAddress.postalCode);
      const shipCountry = escapeHTML(order.shippingAddress.country);

      orderCard.innerHTML = `
        <div class="order-header">
          <div style="display: flex; gap: 2rem;">
            <div class="order-meta-item">
              <div class="order-meta-label">Order Number</div>
              <div class="order-meta-value" style="font-family: monospace; font-size: 0.85rem;">${orderId}</div>
            </div>
            <div class="order-meta-item">
              <div class="order-meta-label">Date Placed</div>
              <div class="order-meta-value">${orderDate}</div>
            </div>
            <div class="order-meta-item">
              <div class="order-meta-label">Total Paid</div>
              <div class="order-meta-value" style="font-size: 1rem;">$${order.totalAmount.toFixed(2)}</div>
            </div>
          </div>
          <div>
            <span class="order-status-badge ${statusClass}">${order.status}</span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1.3fr 0.7fr; gap: 3rem; align-items: start;">
          <div class="order-items-grid">
            ${itemsHtml}
          </div>
          <div style="font-size: 0.9rem; border-left: var(--border-thin); padding-left: 1.5rem;">
            <div class="order-meta-label" style="margin-bottom: 0.5rem;">Shipping Address</div>
            <div style="font-weight: 500; margin-bottom: 0.25rem;">${shipName}</div>
            <div style="color: var(--text-muted); line-height: 1.4;">
              ${shipAddr1}<br>
              ${shipCity}, ${shipZip}<br>
              ${shipCountry}
            </div>
          </div>
        </div>
      `;

      listEl.appendChild(orderCard);
    });

    listEl.classList.remove('hidden');
    emptyEl.classList.add('hidden');
  }
});
