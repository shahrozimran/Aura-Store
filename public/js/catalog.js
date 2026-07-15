document.addEventListener('DOMContentLoaded', () => {
  const productsGrid = document.getElementById('products-grid');
  const catalogLoading = document.getElementById('catalog-loading');
  const catalogError = document.getElementById('catalog-error');
  const catalogEmpty = document.getElementById('catalog-empty');
  const categoryFilters = document.getElementById('category-filters');
  const sortSelect = document.getElementById('sort-select');

  let currentCategory = 'all';
  let currentSort = '';

  // Initial products fetch
  fetchAndRenderProducts();

  // Category filter handlers
  categoryFilters.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-btn')) {
      // Update active styling
      const buttons = categoryFilters.querySelectorAll('.filter-btn');
      buttons.forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');

      // Update state and query
      currentCategory = e.target.getAttribute('data-category');
      fetchAndRenderProducts();
    }
  });

  // Sort handler
  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    fetchAndRenderProducts();
  });

  // Core fetch & render logic
  async function fetchAndRenderProducts() {
    showLoading();
    try {
      const products = await api.getProducts(currentCategory, currentSort);
      renderGrid(products);
    } catch (error) {
      showError(error.message);
    }
  }

  function showLoading() {
    catalogLoading.classList.remove('hidden');
    productsGrid.classList.add('hidden');
    catalogError.classList.add('hidden');
    catalogEmpty.classList.add('hidden');
  }

  function showError(msg) {
    catalogLoading.classList.add('hidden');
    productsGrid.classList.add('hidden');
    catalogEmpty.classList.add('hidden');
    catalogError.textContent = `Error: ${msg}. Please try reloading the page.`;
    catalogError.classList.remove('hidden');
  }

  function renderGrid(products) {
    catalogLoading.classList.add('hidden');
    catalogError.classList.add('hidden');
    productsGrid.innerHTML = '';

    if (products.length === 0) {
      productsGrid.classList.add('hidden');
      catalogEmpty.classList.remove('hidden');
      return;
    }

    products.forEach(product => {
      const card = document.createElement('a');
      card.href = `product.html?id=${product._id}`;
      card.className = 'product-card';
      card.innerHTML = `
        <div class="product-image-container">
          <img src="${product.imageUrl}" class="product-image" alt="${product.title}" loading="lazy" onerror="this.onerror=null; this.src='https://placehold.co/600x600/FAF8F5/222222?text=${encodeURIComponent(product.title)}'">
        </div>
        <div class="product-info">
          <span class="product-cat">${product.category}</span>
          <h3 class="product-title">${product.title}</h3>
          <span class="product-price">$${product.price.toFixed(2)}</span>
        </div>
      `;
      productsGrid.appendChild(card);
    });

    productsGrid.classList.remove('hidden');
    catalogEmpty.classList.add('hidden');
  }
});
