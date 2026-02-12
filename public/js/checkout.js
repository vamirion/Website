// public/js/checkout.js
document.addEventListener('DOMContentLoaded', () => {
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutTotal = document.getElementById('checkout-total');
    const purchaseBtn = document.getElementById('purchase-btn');

    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

    const saveCart = () => localStorage.setItem('cartItems', JSON.stringify(cartItems));

    const calculateTotal = () => 
        cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    const renderCart = () => {
        if (!checkoutItems) return;

        checkoutItems.innerHTML = '';

        if (cartItems.length === 0) {
            checkoutItems.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;">Your cart is empty.</td>
                </tr>`;
            checkoutTotal.innerText = '$0.00';
            if (purchaseBtn) purchaseBtn.disabled = true;
            return;
        }

        cartItems.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <img src="${item.image || 'assets/placeholder.jpg'}" style="width:50px;height:50px;object-fit:cover;">
                    ${item.name}
                </td>
                <td>$${Number(item.price).toFixed(2)}</td>
                <td>
                    <button class="dec" data-index="${index}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="inc" data-index="${index}">+</button>
                </td>
                <td>$${(Number(item.price) * item.quantity).toFixed(2)}</td>
                <td><button class="remove" data-index="${index}">Remove</button></td>
            `;
            checkoutItems.appendChild(tr);
        });

        checkoutTotal.innerText = `$${calculateTotal().toFixed(2)}`;
        if (purchaseBtn) purchaseBtn.disabled = false;

        attachCartEventListeners();
    };

    const attachCartEventListeners = () => {
        document.querySelectorAll('.inc').forEach(btn => btn.addEventListener('click', handleIncrement));
        document.querySelectorAll('.dec').forEach(btn => btn.addEventListener('click', handleDecrement));
        document.querySelectorAll('.remove').forEach(btn => btn.addEventListener('click', handleRemove));
    };

    const handleIncrement = (e) => {
        const index = e.target.dataset.index;
        cartItems[index].quantity++;
        saveCart();
        renderCart();
    };

    const handleDecrement = (e) => {
        const index = e.target.dataset.index;
        if (cartItems[index].quantity > 1) cartItems[index].quantity--;
        saveCart();
        renderCart();
    };

    const handleRemove = (e) => {
        const index = e.target.dataset.index;
        cartItems.splice(index, 1);
        saveCart();
        renderCart();
    };

    renderCart();

    // Handle checkout
    if (purchaseBtn) {
        purchaseBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (cartItems.length === 0) return alert('Your cart is empty!');

            // Get form values
            const customerName = document.getElementById('customerName').value.trim();
            const customerEmail = document.getElementById('customerEmail').value.trim();
            const shippingAddress = document.getElementById('shippingAddress').value.trim();
            const shippingCity = document.getElementById('shippingCity').value.trim();
            const shippingPostal = document.getElementById('shippingPostal').value.trim();

            // Validate
            if (!customerName || !customerEmail || !shippingAddress || !shippingCity || !shippingPostal) {
                return alert('Please fill in all fields');
            }
            if (!customerEmail.includes('@')) return alert('Enter a valid email');

            purchaseBtn.disabled = true;
            purchaseBtn.textContent = 'Processing...';

            try {
                const response = await fetch('/create-checkout-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        cartItems,
                        customerName,
                        customerEmail,
                        shippingAddress,
                        shippingCity,
                        shippingPostal
                    })
                });

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(text || 'Failed to create checkout session');
                }

                const data = await response.json();
                if (!data.url) throw new Error('No checkout URL returned');

                localStorage.removeItem('cartItems');
                window.location.href = data.url;

            } catch (err) {
                console.error('Checkout error:', err);
                alert('Checkout failed: ' + err.message);
                purchaseBtn.disabled = false;
                purchaseBtn.textContent = 'Proceed to Checkout';
            }
        });
    }
});
