const CART_KEY = 'farmacia-cart';

const cartItemsContainer = document.querySelector('.cart-items');
const cartTotalElement = document.querySelector('.cart-total');
const checkoutButton = document.querySelector('.checkout-button');
const clearButton = document.querySelector('.cart-clear-button');
const cartCount = document.querySelector('.cart-count');

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
  if (!cartCount) return;
  const totalItems = getCart().reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = String(totalItems);
}

function updateQuantity(productId, change) {
  const cart = getCart();
  const item = cart.find((entry) => entry.id === productId);
  if (!item) return;

  item.quantity += change;
  if (item.quantity < 1) {
    removeItem(productId);
    return;
  }

  saveCart(cart);
  renderCart();
}

function removeItem(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
  renderCart();
}

function clearCart() {
  saveCart([]);
  renderCart();
}

function checkout() {
  const cart = getCart();
  if (!cart.length) return;

  alert('Gracias por su compra. Su orden se ha registrado correctamente.');
  clearCart();
}

function renderCart() {
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
            <p>${formatPrice(itemTotal)}</p>
          </div>
          <div class="cart-item-actions">
            <button onclick="updateQuantity(${item.id}, -1)">-</button>
            <button onclick="updateQuantity(${item.id}, 1)">+</button>
            <button onclick="removeItem(${item.id})">Eliminar</button>
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

window.updateQuantity = updateQuantity;
window.removeItem = removeItem;
window.clearCart = clearCart;
window.checkout = checkout;

renderCart();
updateCartCount();
