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

function getCart() {
  const stored = localStorage.getItem(CART_KEY);
  return stored ? JSON.parse(stored) : [];
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

function renderProducts() {
  productsGrid.innerHTML = products
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
  const grid = document.querySelector('.products-grid');
  if (!grid) return;

  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    if (window.PAGE_CATEGORY) {
      return renderCategory(window.PAGE_CATEGORY);
    }
    return renderProducts();
  }

  const tokens = normalized.split(/\s+/);
  const source = window.PAGE_CATEGORY
    ? products.filter((item) => item.category === window.PAGE_CATEGORY)
    : products;

  const result = source.filter((product) => {
    const searchable = `${product.name} ${product.description}`.toLowerCase();
    return tokens.every((token) => searchable.includes(token));
  });

  if (!result.length) {
    grid.innerHTML = '<p class="empty-message">No se encontraron productos similares.</p>';
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

function renderOffers(count = 4) {
  const container = document.querySelector('.offer-cards');
  if (!container) return;

  const available = products.slice();
  const picks = [];
  const n = Math.min(count, available.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * available.length);
    picks.push(available.splice(idx, 1)[0]);
  }

  const html = picks
    .map((product) => {
      const discount = getRandomInt(30, 65);
      const oldPrice = product.price;
      const newPrice = Math.round(oldPrice * (1 - discount / 100));
      return `
        <article class="offer-card">
          <img src="${product.image}" alt="${product.name}" />
          <div>
            <p class="offer-name">${product.name}</p>
            <p class="offer-price"><span>${formatPrice(oldPrice)}</span> ${formatPrice(newPrice)}</p>
            <div class="offer-badge">-${discount}%</div>
          </div>
        </article>
      `;
    })
    .join('');

  container.innerHTML = html;
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const cart = getCart();
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
  updateCartCount();
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

// If a category page sets `window.PAGE_CATEGORY`, render that category instead
if (window.PAGE_CATEGORY) {
  renderCategory(window.PAGE_CATEGORY);
  updateCartCount();
  setupSearch();
} else {
  renderProducts();
  updateCartCount();
  renderOffers();
  setupSearch();
}
