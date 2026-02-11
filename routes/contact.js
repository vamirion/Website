const express = require('express');
const router = express.Router();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

router.post('/', async (req, res) => {
  const { name, email, message, website } = req.body;

  if (website) {
    return res.status(400).json({ success: false, message: 'Spam detected' });
  }

  try {
    console.log("Sending admin email...");

    const adminEmail = await resend.emails.send({
      from: 'CodeNest <onboarding@resend.dev>',
      to: 'codenestsg@gmail.com',
      reply_to: email,
      subject: `New Enquiry from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p>${message}</p>
      `,
    });

    console.log("Admin email sent:", adminEmail);

    console.log("Sending auto reply...");

    const autoReply = await resend.emails.send({
      from: 'CodeNest <onboarding@resend.dev>',
      to: email,
      subject: 'We received your enquiry at CodeNest!',
      html: `
        <p>Hi ${name},</p>
        <p>Thank you for reaching out to CodeNest 😊</p>
      `,
    });

    console.log("Auto reply sent:", autoReply);

    res.json({ success: true });

  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;