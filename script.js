const CART_KEY = 'farmacia-cart';

const products = [
  {
    id: 1,
    name: 'Kit de perfumes para bebés',
    description: 'Aromas suaves y seguros para el cuidado delicado de tu bebé.',
    price: 24900,
    image: 'visuales/colonia de bebe.jpg',
    category: 'infantil',
  },
  {
    id: 2,
    name: 'Pack vitaminas',
    description: 'Multivitamínico diario para energía y apoyo al sistema inmunitario.',
    price: 18500,
    image: 'visuales/vitaminas.png',
    category: 'infantil',
  },
  {
    id: 3,
    name: 'Cremas de cuidado',
    description: 'Cremas calmantes y antinflamatorias para piel sensible.',
    price: 14990,
    image: 'visuales/cremas.jpg',
    category: 'cosmetica',
  },
  {
    id: 4,
    name: 'Cuidado bucal',
    description: 'Pasta dental, enjuague y accesorios para una higiene completa.',
    price: 12750,
    image: 'visuales/Cuidado bucal.jpg',
    category: 'higiene',
  },
];

const productsGrid = document.querySelector('.products-grid');
const cartCountElements = document.querySelectorAll('.cart-count, .cart-bubble-count');
const offerPicks = getOfferPicks(4);

function getSelectedCategories() {
  const inputs = Array.from(document.querySelectorAll('.filters-panel input[name="category"]'));
  if (!inputs.length) {
    return window.PAGE_CATEGORY ? [window.PAGE_CATEGORY] : [];
  }

  const checked = inputs.filter((input) => input.checked).map((input) => input.value);
  return checked.length ? checked : [];
}

function getCart() {
  const stored = localStorage.getItem(CART_KEY);
  return stored ? JSON.parse(stored) : [];
}

function getOfferPicks(count = 4) {
  const available = products.slice();
  const picks = [];
  const n = Math.min(count, available.length);

  for (let i = 0; i < n; i += 1) {
    const index = Math.floor(Math.random() * available.length);
    const product = available.splice(index, 1)[0];
    const discount = getRandomInt(30, 65);
    const discountedPrice = Math.round(product.price * (1 - discount / 100));

    picks.push({
      ...product,
      discount,
      originalPrice: product.price,
      offerPrice: discountedPrice,
    });
  }

  return picks;
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function formatPrice(value) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value);
}

function updateCartCount() {
  if (!cartCountElements.length) return;
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  cartCountElements.forEach((element) => {
    element.textContent = String(count);
  });
}

function openCartPopup() {
  const modal = document.getElementById('cart-modal');
  if (!modal) return;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  renderCartPopup();
}

function closeCartPopup() {
  const modal = document.getElementById('cart-modal');
  if (!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}

function renderCartPopup() {
  const cartItemsContainer = document.querySelector('.cart-items');
  const cartTotalElement = document.querySelector('.cart-total');
  const checkoutButton = document.querySelector('.checkout-button');
  const clearButton = document.querySelector('.cart-clear-button');
  if (!cartItemsContainer || !cartTotalElement || !checkoutButton || !clearButton) return;

  const cart = getCart();
  cartItemsContainer.innerHTML = '';
  if (!cart.length) {
    cartItemsContainer.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío. Agrega productos desde la tienda.</p>';
    cartTotalElement.textContent = formatPrice(0);
    checkoutButton.disabled = true;
    clearButton.disabled = true;
    updateCartCount();
    return;
  }

  let total = 0;
  const itemsHtml = cart
    .map((item) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      return `
        <article class="cart-item">
          <img src="${item.image}" alt="${item.name}" />
          <div class="cart-item-info">
            <h3>${item.name}</h3>
            <p>${formatPrice(item.price)} x ${item.quantity}</p>
            ${item.discount > 0 ? `<p class="cart-item-original">${formatPrice(item.originalPrice)}</p><p class="cart-item-discount">-${item.discount}%</p>` : ''}
            <p>${formatPrice(itemTotal)}</p>
          </div>
          <div class="cart-item-actions">
            <button onclick="updateQuantity(${item.id}, ${item.price}, -1)">-</button>
            <button onclick="updateQuantity(${item.id}, ${item.price}, 1)">+</button>
            <button onclick="removeItem(${item.id}, ${item.price})">Eliminar</button>
          </div>
        </article>
      `;
    })
    .join('');

  cartItemsContainer.innerHTML = itemsHtml;
  cartTotalElement.textContent = formatPrice(total);
  checkoutButton.disabled = false;
  clearButton.disabled = false;
  updateCartCount();
}

function updateQuantity(productId, unitPrice, change) {
  const cart = getCart();
  const item = cart.find((entry) => entry.id === productId && entry.price === unitPrice);
  if (!item) return;

  item.quantity += change;
  if (item.quantity < 1) {
    removeItem(productId, unitPrice);
    return;
  }

  saveCart(cart);
  renderCartPopup();
}

function removeItem(productId, unitPrice) {
  const cart = getCart().filter((entry) => !(entry.id === productId && entry.price === unitPrice));
  saveCart(cart);
  renderCartPopup();
}

function clearCart() {
  saveCart([]);
  renderCartPopup();
}

function checkout() {
  const cart = getCart();
  if (!cart.length) return;
  alert('Gracias por su compra. Su orden se ha registrado correctamente.');
  clearCart();
}


function renderProducts(query = '') {
  const grid = document.querySelector('.products-grid');
  if (!grid) return;

  const activeCategories = getSelectedCategories();
  const source = activeCategories.length
    ? products.filter((product) => activeCategories.includes(product.category))
    : window.PAGE_CATEGORY
    ? products.filter((product) => product.category === window.PAGE_CATEGORY)
    : products;

  const normalized = query.trim().toLowerCase();
  const result = normalized
    ? source.filter((product) => {
        const searchable = `${product.name} ${product.description}`.toLowerCase();
        return normalized.split(/\s+/).every((token) => searchable.includes(token));
      })
    : source;

  if (!result.length) {
    grid.innerHTML = '<p class="empty-message">No se encontraron productos con estos filtros.</p>';
    return;
  }

  grid.innerHTML = result
    .map(
      (product) => `
        <article class="product-card">
          <img class="product-image" src="${product.image}" alt="${product.name}" />
          <div class="product-body">
            <div>
              <h3 class="product-title">${product.name}</h3>
              <p class="product-description">${product.description}</p>
            </div>
            <div class="product-footer">
              <span class="product-price">${formatPrice(product.price)}</span>
              <button onclick="addToCart(${product.id})">Añadir al carrito</button>
            </div>
          </div>
        </article>
      `
    )
    .join('');
}

function renderCategory(category) {
  const grid = document.querySelector('.products-grid');
  if (!grid) return;
  const filtered = products.filter((p) => p.category === category);
  if (!filtered.length) {
    grid.innerHTML = '<p class="empty-message">No hay productos en esta categoría todavía.</p>';
    return;
  }

  grid.innerHTML = filtered
    .map(
      (product) => `
        <article class="product-card">
          <img class="product-image" src="${product.image}" alt="${product.name}" />
          <div class="product-body">
            <div>
              <h3 class="product-title">${product.name}</h3>
              <p class="product-description">${product.description}</p>
            </div>
            <div class="product-footer">
              <span class="product-price">${formatPrice(product.price)}</span>
              <button onclick="addToCart(${product.id})">Añadir al carrito</button>
            </div>
          </div>
        </article>
      `
    )
    .join('');
}

function searchProducts(query) {
  renderProducts(query);
}

function setupFilters() {
  const inputs = Array.from(document.querySelectorAll('.filters-panel input[name="category"]'));
  const searchInput = document.querySelector('.search-bar input');
  if (!inputs.length || !searchInput) return;

  inputs.forEach((input) => {
    input.addEventListener('change', () => {
      renderProducts(searchInput.value);
    });
  });
}

function setupSearch() {
  const searchInput = document.querySelector('.search-bar input');
  const searchButton = document.querySelector('.search-bar button');
  if (!searchInput || !searchButton) return;

  searchButton.addEventListener('click', () => searchProducts(searchInput.value));
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      searchProducts(searchInput.value);
    }
  });
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chooseFeaturedProduct() {
  const useOffer = Math.random() < 0.5 && offerPicks.length > 0;

  if (useOffer) {
    const offer = offerPicks[Math.floor(Math.random() * offerPicks.length)];
    return {
      ...offer,
      isOffer: true,
      displayPrice: offer.offerPrice,
      buttonPrice: offer.offerPrice,
    };
  }

  const normalProduct = products[Math.floor(Math.random() * products.length)];
  return {
    ...normalProduct,
    isOffer: false,
    displayPrice: normalProduct.price,
    buttonPrice: normalProduct.price,
  };
}

let featuredProduct = chooseFeaturedProduct();

function renderFeaturedProduct() {
  const featuredName = document.querySelector('.featured-name');
  const featuredDescription = document.querySelector('.featured-description');
  const featuredPricing = document.querySelector('.featured-pricing');
  const featuredButton = document.getElementById('featured-add-button');
  const featuredImg = document.querySelector('.featured-product-img');
  if (!featuredName || !featuredDescription || !featuredPricing || !featuredButton) return;

  console.log('Rendering featured product:', featuredProduct && featuredProduct.id);
  featuredName.textContent = featuredProduct.name;
  featuredDescription.textContent = featuredProduct.description;
  if (featuredImg) {
    if (featuredProduct.image) {
      featuredImg.src = featuredProduct.image;
      featuredImg.alt = featuredProduct.name || 'Producto destacado';
      featuredImg.style.display = '';
    } else {
      featuredImg.style.display = 'none';
    }
  }

  const pricingHtml = featuredProduct.isOffer
    ? `
          <span class="featured-price-old">${formatPrice(featuredProduct.originalPrice)}</span>
          <span class="featured-price-current">${formatPrice(featuredProduct.displayPrice)}</span>
          <span class="featured-badge">-${featuredProduct.discount}%</span>
        `
    : `
          <span class="featured-price-current">${formatPrice(featuredProduct.displayPrice)}</span>
        `;

  featuredPricing.innerHTML = pricingHtml;
  featuredButton.onclick = () => addToCart(featuredProduct.id, featuredProduct.buttonPrice);
}

function refreshFeatured() {
  featuredProduct = chooseFeaturedProduct();
  renderFeaturedProduct();
}

// Wire refresh button if present
document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'featured-refresh-button') {
    refreshFeatured();
  }
});

function renderOffers(count = 4) {
  const container = document.querySelector('.offer-cards');
  if (!container) return;

  const html = offerPicks
    .slice(0, count)
    .map((offer) => `
        <article class="offer-card">
          <img src="${offer.image}" alt="${offer.name}" />
          <div>
            <p class="offer-name">${offer.name}</p>
            <p class="offer-price"><span>${formatPrice(offer.originalPrice)}</span> ${formatPrice(offer.offerPrice)}</p>
            <div class="offer-footer">
              <div class="offer-badge">-${offer.discount}%</div>
              <button onclick="addToCart(${offer.id}, ${offer.offerPrice})">Añadir al carrito</button>
            </div>
          </div>
        </article>
      `)
    .join('');

  container.innerHTML = html;
}

function addToCart(productId, customPrice) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const unitPrice = typeof customPrice === 'number' ? customPrice : product.price;
  const cart = getCart();
  const existingItem = cart.find(
    (item) => item.id === productId && item.price === unitPrice
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      price: unitPrice,
      quantity: 1,
      originalPrice: product.price,
      discount: typeof customPrice === 'number' ? Math.round(100 * (product.price - unitPrice) / product.price) : 0,
    });
  }

  saveCart(cart);
  updateCartCount();
  const modal = document.getElementById('cart-modal');
  if (modal && modal.classList.contains('show')) {
    renderCartPopup();
  }
}

function scrollToCatalog() {
  document.querySelector('.products-grid').scrollIntoView({ behavior: 'smooth' });
}

function scrollToContact() {
  document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
}

window.addToCart = addToCart;
window.scrollToCatalog = scrollToCatalog;
window.scrollToContact = scrollToContact;
window.openCartPopup = openCartPopup;
window.closeCartPopup = closeCartPopup;
window.clearCart = clearCart;
window.checkout = checkout;

// If a category page sets `window.PAGE_CATEGORY`, render that category instead
if (window.PAGE_CATEGORY) {
  renderCategory(window.PAGE_CATEGORY);
  updateCartCount();
  setupSearch();
  setupFilters();
} else {
  renderFeaturedProduct();
  renderProducts();
  updateCartCount();
  renderOffers();
  setupSearch();
  setupFilters();
}
