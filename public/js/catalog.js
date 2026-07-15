document.addEventListener('DOMContentLoaded', () => {
  const productsGrid = document.getElementById('products-grid');
  const catalogLoading = document.getElementById('catalog-loading');
  const catalogError = document.getElementById('catalog-error');
  const catalogEmpty = document.getElementById('catalog-empty');
  const categoryFilters = document.getElementById('category-filters');
  const sortSelect = document.getElementById('sort-select');
  
  // Search DOM Elements
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const searchSuggestions = document.getElementById('search-suggestions');

  let currentCategory = 'all';
  let currentSort = '';
  let currentSearch = '';
  let debounceTimer;

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

  // Debounced Auto-suggestions Logic
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = searchInput.value.trim();

    if (query.length < 1) {
      searchSuggestions.innerHTML = '';
      searchSuggestions.classList.add('hidden');
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const products = await api.getProducts('all', '', query);
        renderSuggestions(products);
      } catch (error) {
        console.error('Suggestions fetch error:', error);
      }
    }, 200);
  });

  function renderSuggestions(products) {
    searchSuggestions.innerHTML = '';

    if (products.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'suggestion-no-results';
      emptyDiv.textContent = 'No matching objects found';
      searchSuggestions.appendChild(emptyDiv);
    } else {
      // Limit to max 5 suggestion results
      products.slice(0, 5).forEach(prod => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.innerHTML = `
          <img class="suggestion-img" src="${prod.imageUrl}" alt="${prod.title}" onerror="this.onerror=null; this.src='https://placehold.co/50x50/FAF8F5/222222?text=${encodeURIComponent(prod.title)}'">
          <div class="suggestion-details">
            <span class="suggestion-title">${prod.title}</span>
            <span class="suggestion-cat">${prod.category}</span>
          </div>
        `;
        item.addEventListener('click', () => {
          window.location.href = `product.html?id=${prod._id}`;
        });
        searchSuggestions.appendChild(item);
      });
    }
    searchSuggestions.classList.remove('hidden');
  }

  // Handle Search Submission (clicking Search button or pressing Enter)
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearTimeout(debounceTimer);
    searchSuggestions.classList.add('hidden');
    currentSearch = searchInput.value.trim();
    fetchAndRenderProducts();
  });

  // Dismiss suggestions dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
      searchSuggestions.classList.add('hidden');
    }
  });

  // Dismiss suggestions dropdown with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchSuggestions.classList.add('hidden');
    }
  });

  // Core fetch & render logic
  async function fetchAndRenderProducts() {
    showLoading();
    try {
      const products = await api.getProducts(currentCategory, currentSort, currentSearch);
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
