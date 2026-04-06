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
      from: 'CodeNest Team <hello@codenestsg.com>',
      to: email,
      subject: 'We received your enquiry at CodeNest!',
      html: `
        <p>Hi ${name},</p>
        <p>Thank you for reaching out to CodeNest!</p> 
        
        <p>We’ve received your enquiry and will get back to you within 24 hours.</p>

        <p>In the meantime, here’s what to expect:</p>
        <p>✅ Hands-on coding projects </p>
        <p>✅ Personalized learning experience </p>
        <p>✅ Structured 12-lesson pathway </p>

        <p>Looking forward to helping your child get started!😊</p>

        <p>– CodeNest Team</p>
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