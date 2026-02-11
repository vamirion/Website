// Product data
const products = [
    {
        id: "mbot2",
        name: "mBot2 Coding Robot",
        price: 179.00,
        image: "assets/mbot.png",
        description: "The mBot2 is a versatile coding robot designed for beginners to learn programming concepts through hands-on play."
    }
];

// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');
const product = products.find(p => p.id === productId);

// If product not found
if (!product) {
    document.body.innerHTML = '<h2>Product not found</h2>';
} else {
    // Populate product details
    document.getElementById('product-img').src = product.image;
    document.getElementById('product-img').alt = product.name;
    document.getElementById('product-name').innerText = product.name;
    document.getElementById('product-price').innerText = `$${product.price.toFixed(2)}`;
    document.getElementById('product-desc').innerText = product.description;
}

// Add to Cart button
const addToCartBtn = document.getElementById('add-to-cart-btn');

// Function to update the cart counter
function updateCartCounter() {
    const cartCount = document.getElementById('cart-count');
    if (!cartCount) return;

    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.innerText = totalCount;
}

// Function to handle flying animation to cart
function flyToCart(imgEl, cartEl) {
    if (!imgEl || !cartEl) return Promise.resolve();

    return new Promise(resolve => {
        const imgRect = imgEl.getBoundingClientRect();
        const cartRect = cartEl.getBoundingClientRect();

        const fly = imgEl.cloneNode(true);
        fly.style.position = 'fixed';
        fly.style.left = `${imgRect.left}px`;
        fly.style.top = `${imgRect.top}px`;
        fly.style.width = `${imgRect.width}px`;
        fly.style.height = `${imgRect.height}px`;
        fly.style.transition = 'transform 700ms cubic-bezier(.65,0,.35,1), opacity 700ms';
        fly.style.zIndex = 9999;
        fly.style.pointerEvents = 'none';
        document.body.appendChild(fly);

        requestAnimationFrame(() => {
            const dx = (cartRect.left + cartRect.width / 2) - (imgRect.left + imgRect.width / 2);
            const dy = (cartRect.top + cartRect.height / 2) - (imgRect.top + imgRect.height / 2);
            fly.style.transform = `translate(${dx}px, ${dy}px) scale(0.25)`;
            fly.style.opacity = '0.6';
        });

        fly.addEventListener('transitionend', () => {
            fly.remove();
            resolve();
        }, { once: true });
    });
}

// Function to make cart bounce
function bounceCart(cartEl) {
    if (!cartEl) return;
    cartEl.classList.add('cart-bounce');
    cartEl.addEventListener('animationend', () => cartEl.classList.remove('cart-bounce'), { once: true });
}

// Add to cart click handler
addToCartBtn.addEventListener('click', async () => {
    const productImageEl = document.getElementById('product-img');
    const cartEl = document.getElementById('cart') || document.querySelector('.cart, .cart-btn, .cart-icon');

    // Play flying animation
    await flyToCart(productImageEl, cartEl);
    bounceCart(cartEl);

    // Load cart from localStorage
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

    // Add product or increment quantity
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) existingItem.quantity++;
    else cartItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
    });

    // Save updated cart
    localStorage.setItem('cartItems', JSON.stringify(cartItems));

    // Update counter
    updateCartCounter();

    // Trigger mini-cart refresh for shop page
    const event = new Event('cartUpdated');
    window.dispatchEvent(event);
});

// Initialize cart counter on page load
updateCartCounter();
