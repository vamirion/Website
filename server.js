require('dotenv').config();
const express = require('express');
const app = express();
const contactRoutes = require('./routes/contact');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const path = require('path');
const fs = require('fs');

// =========================
// Middleware
// =========================

app.set('trust proxy', 1); // for Render.com compatibility
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// =========================
// Rate Limiter (Contact)
// =========================

const contactLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 2,
  message: "Too many submissions. Please try again later."
});

app.use('/contact', contactLimiter, contactRoutes);

const PORT = process.env.PORT || 3000;

// =========================
// Stripe Checkout Route
// =========================


const ORDERS_FILE = path.join(__dirname, 'orders.json');

// Helper: save order to JSON
function saveOrder(order) {
    let orders = [];
    if (fs.existsSync(ORDERS_FILE)) {
        orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
    }
    orders.push(order);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { cartItems, customerEmail, shipping } = req.body;

    const line_items = cartItems.map(item => ({
      price_data: {
        currency: 'sgd',
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Dynamic base URL (works locally + on Render)
    const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: customerEmail,
      shipping_address_collection: { allowed_countries: ['SG'] },
      success_url: `${baseUrl}/success.html`,
      cancel_url: `${baseUrl}/cancel.html`,
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Stripe webhook to capture order after payment
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        // Save order to JSON
        const order = {
            email: session.customer_email,
            shipping: session.shipping,
            items: session.display_items || session.line_items,
            amount_total: session.amount_total / 100,
            timestamp: new Date().toISOString(),
        };

        saveOrder(order);
        console.log('✅ Order saved:', order);
    }

    res.json({ received: true });
});

// =========================
// Start Server (Render Compatible)
// =========================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
