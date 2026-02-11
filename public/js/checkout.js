document.addEventListener('DOMContentLoaded', () => {
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutTotal = document.getElementById('checkout-total');
    const purchaseBtn = document.getElementById('purchase-btn');
    const BASE_URL = window.location.origin; // will automatically use the current domain

    // Load cart items from LocalStorage
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

    function saveCart() {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }

    function renderCart() {
    checkoutItems.innerHTML = '';
    let total = 0;

    if (cartItems.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="5">Your cart is empty.</td>`;
        checkoutItems.appendChild(emptyRow);
        checkoutTotal.innerText = '$0';
        purchaseBtn.disabled = true;
        purchaseBtn.style.opacity = 0.5;
        return;
    }

    cartItems.forEach((item, index) => {
        total += item.price * item.quantity;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${item.image}" alt="${item.name}">${item.name}</td>
            <td>${item.price.toFixed(2)}</td>
            <td>${item.quantity}</td>
            <td>${(item.price*item.quantity).toFixed(2)}</td>
            <td>
                <button class="dec">-</button>
                <button class="inc">+</button>
                <button class="remove">x</button>
            </td>
        `;

        checkoutItems.appendChild(tr);

        // Button handlers
        tr.querySelector('.inc').addEventListener('click', () => {
            item.quantity++;
            saveCart();
            renderCart();
        });

        tr.querySelector('.dec').addEventListener('click', () => {
            if (item.quantity > 1) item.quantity--;
            saveCart();
            renderCart();
        });

        tr.querySelector('.remove').addEventListener('click', () => {
            cartItems.splice(index, 1);
            saveCart();
            renderCart();
        });
    });

    checkoutTotal.innerText = '$' + total.toFixed(2);
    purchaseBtn.disabled = false;
    purchaseBtn.style.opacity = 1;
    }

    renderCart();

    // Complete purchase
    purchaseBtn.addEventListener('click', async () => {
        if (cartItems.length === 0) return;

        try {
            const response = await fetch(`${BASE_URL}/create-checkout-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cartItems }),
            });

            const data = await response.json();
            window.location.href = data.url; // redirect to Stripe checkout
        } catch (err) {
            console.error('Payment failed', err);
            alert('Payment could not be processed.');
        }
    });
});
