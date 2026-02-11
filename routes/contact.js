const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

router.post('/', async (req, res) => {
  const { name, email, message, website } = req.body;

  // HONEYPOT CHECK
  if (website) {
    return res.status(400).json({ success: false, message: 'Spam detected' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
      from: 'codenestsg@gmail.com',           // Use your own Gmail
      replyTo: email,                         // Parent can reply to their email
      to: 'codenestsg@gmail.com',
      subject: `New Enquiry from ${name}`,
      text: `
Name: ${name}
Email: ${email}
Message: ${message}
      `
    });

    // auto-reply to parent
    await transporter.sendMail({
      from: 'codenestsg@gmail.com',
      to: email,
      subject: 'We received your enquiry at CodeNest!',
      text: `
Hi ${name},

Thank you for reaching out to CodeNest! 😊
We have received your message and will get back to you shortly.

Best regards,
CodeNest Team
      `
    });

    res.json({ success: true });

  } catch (err) {
    console.error(err); // Check terminal for exact error
    res.status(500).json({ success: false, message: err.message }); // Send real error to JS
  }
});

module.exports = router;
