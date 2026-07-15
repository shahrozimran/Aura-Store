document.addEventListener('DOMContentLoaded', async () => {
  const loadingElement = document.getElementById('product-loading');
  const errorElement = document.getElementById('product-error');
  const productContainer = document.getElementById('product-container');

  // DOM Elements for product details
  const productImage = document.getElementById('product-image');
  const productCategory = document.getElementById('product-category');
  const productTitle = document.getElementById('product-title');
  const productPrice = document.getElementById('product-price');
  const productDescription = document.getElementById('product-description');
  const qtyInput = document.getElementById('qty-input');
  const btnDecrease = document.getElementById('btn-decrease');
  const btnIncrease = document.getElementById('btn-increase');
  const btnAddToCart = document.getElementById('btn-add-to-cart');
  const stockStatus = document.getElementById('product-stock-status');

  // Get Product ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    showError('No product ID specified.');
    return;
  }

  let product = null;
  let selectedQty = 1;

  // Load product details
  try {
    product = await api.getProductById(productId);
    renderProductDetails();
  } catch (error) {
    showError(error.message);
  }

  function showError(msg) {
    loadingElement.classList.add('hidden');
    productContainer.classList.add('hidden');
    errorElement.textContent = `Error: ${msg}`;
    errorElement.classList.remove('hidden');
  }

  function renderProductDetails() {
    loadingElement.classList.add('hidden');
    
    // Set text contents
    document.title = `${product.title} - AURA Store`;
    productImage.onerror = () => {
      productImage.onerror = null;
      productImage.src = `https://placehold.co/600x600/FAF8F5/222222?text=${encodeURIComponent(product.title)}`;
    };
    productImage.src = product.imageUrl;
    productImage.alt = product.title;
    productCategory.textContent = product.category;
    productTitle.textContent = product.title;
    productPrice.textContent = `$${product.price.toFixed(2)}`;
    productDescription.textContent = product.description;

    // Handle stock status and button disabling
    if (product.stock === 0) {
      stockStatus.textContent = 'Out of Stock';
      stockStatus.className = 'stock-status out-of-stock';
      btnAddToCart.disabled = true;
      btnAddToCart.textContent = 'Sold Out';
      qtyInput.value = 0;
      btnDecrease.disabled = true;
      btnIncrease.disabled = true;
    } else {
      stockStatus.textContent = `In Stock (${product.stock} available)`;
      stockStatus.className = 'stock-status in-stock';
      
      // Hook up quantity events
      btnDecrease.addEventListener('click', () => {
        if (selectedQty > 1) {
          selectedQty--;
          qtyInput.value = selectedQty;
        }
      });

      btnIncrease.addEventListener('click', () => {
        if (selectedQty < product.stock) {
          selectedQty++;
          qtyInput.value = selectedQty;
        } else {
          alert(`Only ${product.stock} items in stock.`);
        }
      });

      // Hook up Add to Cart
      btnAddToCart.addEventListener('click', () => {
        const added = addToCart(
          product._id, 
          selectedQty, 
          product.title, 
          product.price, 
          product.imageUrl, 
          product.stock
        );
        
        if (added) {
          btnAddToCart.textContent = 'Added to Cart';
          btnAddToCart.disabled = true;
          setTimeout(() => {
            btnAddToCart.textContent = 'Add to Cart';
            btnAddToCart.disabled = false;
          }, 1500);
        }
      });
    }

    // Render Features / Specs
    const featuresList = document.getElementById('product-features');
    if (featuresList) {
      featuresList.innerHTML = '';
      if (product.features && product.features.length > 0) {
        product.features.forEach(feat => {
          const li = document.createElement('li');
          li.textContent = feat;
          featuresList.appendChild(li);
        });
      } else {
        featuresList.innerHTML = '<li>No specifications listed</li>';
      }
    }

    // Render Reviews
    const reviewsSection = document.getElementById('reviews-section');
    const reviewsList = document.getElementById('reviews-list');
    if (reviewsSection && reviewsList) {
      reviewsList.innerHTML = '';
      if (product.reviews && product.reviews.length > 0) {
        product.reviews.forEach(rev => {
          const card = document.createElement('div');
          card.className = 'review-card';
          const stars = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);
          card.innerHTML = `
            <div class="review-header">
              <span class="review-user">${rev.username}</span>
              <span class="review-stars">${stars}</span>
            </div>
            <p class="review-comment">${rev.comment}</p>
          `;
          reviewsList.appendChild(card);
        });
        reviewsSection.classList.remove('hidden');
      } else {
        reviewsSection.classList.add('hidden');
      }
    }

    productContainer.classList.remove('hidden');
  }
});
