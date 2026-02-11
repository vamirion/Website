document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.product-card button');
    const cartCountEl = document.getElementById('cart-count');
    const cartBtn = document.getElementById('cart');
    const miniCart = document.getElementById('mini-cart');
    const miniCartItems = document.getElementById('mini-cart-items');
    const miniCartTotal = document.getElementById('mini-cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (!cartBtn || !cartCountEl) return;

    /* -------------------------
       Cart helpers
    ------------------------- */
    function getCartItems() {
        return JSON.parse(localStorage.getItem('cartItems')) || [];
    }

    function setCartItems(items) {
        localStorage.setItem('cartItems', JSON.stringify(items));
    }

    function updateCartCount() {
        const cartItems = getCartItems();
        const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        cartCountEl.innerText = count;
    }

    /* -------------------------
       Mini cart rendering
    ------------------------- */
    function updateMiniCart() {
        const cartItems = getCartItems();
        miniCartItems.innerHTML = '';
        let total = 0;

        cartItems.forEach((item, index) => {
            total += item.price * item.quantity;

            const li = document.createElement('li');
            li.className = 'mini-cart-item';

            li.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="mini-cart-info">
                    <p class="name">${item.name}</p>
                    <p class="qty">x${item.quantity}</p>
                    <p class="price">$${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div class="mini-cart-actions">
                    <button class="dec">-</button>
                    <button class="inc">+</button>
                    <button class="remove">x</button>
                </div>
            `;

            miniCartItems.appendChild(li);

            li.querySelector('.inc').addEventListener('click', () => {
                cartItems[index].quantity++;
                setCartItems(cartItems);
                updateMiniCart();
                updateCartCount();
            });

            li.querySelector('.dec').addEventListener('click', () => {
                if (cartItems[index].quantity > 1) {
                    cartItems[index].quantity--;
                    setCartItems(cartItems);
                    updateMiniCart();
                    updateCartCount();
                }
            });

            li.querySelector('.remove').addEventListener('click', () => {
                cartItems.splice(index, 1);
                setCartItems(cartItems);
                updateMiniCart();
                updateCartCount();
            });
        });

        miniCartTotal.innerText = total.toFixed(2);
    }

    /* -------------------------
       Add to cart (SHOP page)
    ------------------------- */
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const productCard = button.closest('.product-card');
            if (!productCard) return;

            const id = productCard.dataset.id;
            const imgEl = productCard.querySelector('img');
            const titleEl = productCard.querySelector('h3');
            const priceEl = productCard.querySelector('.price');

            if (!id || !imgEl || !titleEl || !priceEl) return;

            const name = titleEl.innerText;
            const price = parseFloat(priceEl.innerText.replace(/[^0-9.]/g, '')) || 0;

            const cartItems = getCartItems();
            const existing = cartItems.find(item => item.id === id);

            if (existing) {
                existing.quantity++;
            } else {
                cartItems.push({
                    id,
                    name,
                    price,
                    image: imgEl.src,
                    quantity: 1
                });
            }

            setCartItems(cartItems);
            updateMiniCart();
            updateCartCount();

            /* Cart bounce */
            cartBtn.classList.remove('bounce');
            void cartBtn.offsetWidth;
            cartBtn.classList.add('bounce');

            /* Fly animation */
            const flyImg = imgEl.cloneNode(true);
            const imgRect = imgEl.getBoundingClientRect();
            const cartRect = cartBtn.getBoundingClientRect();

            flyImg.style.position = 'fixed';
            flyImg.style.top = `${imgRect.top + window.scrollY}px`;
            flyImg.style.left = `${imgRect.left + window.scrollX}px`;
            flyImg.style.width = `${imgRect.width}px`;
            flyImg.style.height = `${imgRect.height}px`;
            flyImg.style.borderRadius = '10px';
            flyImg.style.zIndex = 9999;
            flyImg.style.transition = 'all 0.8s ease-in-out';

            document.body.appendChild(flyImg);

            setTimeout(() => {
                flyImg.style.top = `${cartRect.top + window.scrollY}px`;
                flyImg.style.left = `${cartRect.left + window.scrollX}px`;
                flyImg.style.width = '30px';
                flyImg.style.height = '30px';
                flyImg.style.opacity = '0.5';
            }, 50);

            setTimeout(() => flyImg.remove(), 900);
        });
    });

    /* -------------------------
       UI interactions
    ------------------------- */
    cartBtn.addEventListener('click', () => {
        miniCart.style.display =
            miniCart.style.display === 'block' ? 'none' : 'block';
    });

    checkoutBtn.addEventListener('click', () => {
        if (getCartItems().length === 0) {
            alert('Cart is empty!');
        } else {
            window.location.href = 'checkout.html';
        }
    });

    /* -------------------------
       Init
    ------------------------- */
    updateMiniCart();
    updateCartCount();

    // At the bottom of shop.js (after defining updateMiniCart)
    window.addEventListener('cartUpdated', () => {
    // Reload cart from localStorage
        cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        updateMiniCart();
    });
});
