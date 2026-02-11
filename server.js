require('dotenv').config();
const express = require('express');
const app = express();
const contactRoutes = require('./routes/contact');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const path = require('path');

// =========================
// Middleware
// =========================

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

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { cartItems } = req.body;

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
      success_url: `${baseUrl}/success.html`,
      cancel_url: `${baseUrl}/cancel.html`,
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// =========================
// Start Server (Render Compatible)
// =========================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
