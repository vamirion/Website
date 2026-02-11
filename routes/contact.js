const express = require('express');
const router = express.Router();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

router.post('/', async (req, res) => {
  const { name, email, message, website } = req.body;

  // Honeypot spam check
  if (website) {
    return res.status(400).json({ success: false, message: 'Spam detected' });
  }

  try {
    // Send email to you
    await resend.emails.send({
      from: 'CodeNest <onboarding@resend.dev>', // works immediately
      to: 'codenestsg@gmail.com',
      subject: `New Enquiry from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    // Auto reply to parent
    await resend.emails.send({
      from: 'CodeNest <onboarding@resend.dev>',
      to: email,
      subject: 'We received your enquiry at CodeNest!',
      html: `
        <p>Hi ${name},</p>
        <p>Thank you for reaching out to <strong>CodeNest</strong> 😊</p>
        <p>We’ve received your message and will get back to you shortly.</p>
        <br/>
        <p>Best regards,<br/>CodeNest Team</p>
      `,
    });

    res.json({ success: true });

  } catch (err) {
    console.error('Email Error:', err);
    res.status(500).json({ success: false, message: 'Email failed to send' });
  }
});

module.exports = router;
