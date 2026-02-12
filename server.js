require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const Stripe = require('stripe');
const ordersFilePath = path.join(__dirname,'orders.json');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT || 3000;
const baseURL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.use(express.json());

function readOrders() {
    try {
        if (!fs.existsSync(ordersFilePath)) {
            fs.writeFileSync(ordersFilePath, '[]');
        }

        const data = fs.readFileSync(ordersFilePath, 'utf-8');
        return JSON.parse(data || '[]');
    } catch (err) {
        console.error('Error reading orders file:', err);
        return [];
    }
}

function writeOrders(orders) {
    try {
        fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));
    } catch (err) {
        console.error('Error writing orders file:', err);
    }
}

function adminAuth(req, res, next) {
    console.log('adminKey in request:', req.query.adminKey, req.headers['x-admin-key']);
    console.log('ENV ADMIN_KEY:', process.env.ADMIN_KEY);

    const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
    if (adminKey !== process.env.ADMIN_KEY) {
        return res.status(403).json({ error: 'Access denied: Admins only' });
    }
    next();
}

// ---------- Stripe Checkout ----------
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { cartItems, customerName, customerEmail, shippingAddress, shippingCity, shippingPostal } = req.body;

        if (!cartItems?.length)
            return res.status(400).json({ error: 'Cart is empty' });

        if (!customerName || !customerEmail)
            return res.status(400).json({ error: 'Name/email required' });

        const orders = readOrders();

        const newOrder = {
          id: Date.now(),
          customerName,
          customerEmail,
          shippingAddress,
          shippingCity,
          shippingPostal,
          cartItems,
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        orders.push(newOrder);
        writeOrders(orders);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: customerEmail,
            line_items: cartItems.map(item => ({
                price_data: {
                    currency: 'usd',
                    product_data: { name: item.name },
                    unit_amount: Math.round(Number(item.price) * 100),
                },
                quantity: item.quantity,
            })),
            metadata: {
                orderId: newOrder.id.toString()
            },
            success_url: `${baseURL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseURL}/cancel.html`,
        });

        res.json({ url: session.url });

    } catch (err) {
        console.error('Stripe session error:', err);
        res.status(500).json({ error: err.message });
    }
});


// ---------- Success Page ----------
app.get('/success.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

// Admin can see all orders
app.get('/admin/orders', adminAuth, (req, res) => {
    const orders = readOrders();
    res.json(orders);
});

// ---------- Static Files ----------
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
