// const ContactMessage = require('../models/ContactMessage');

// exports.getContactMessages = async (req, res) => {
//   try {
//     const messages = await ContactMessage.find();
//     res.status(200).json(messages);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch messages' });
//   }
// };

// exports.createContactMessage = async (req, res) => {
//   const { firstName, lastName, email, phone, subject, message } = req.body;

//   if (!firstName || !lastName || !email || !subject || !message) {
//     return res.status(400).json({ error: 'All required fields must be filled out' });
//   }

//   try {
//     const newMessage = new ContactMessage({
//       firstName,
//       lastName,
//       email,
//       phone,
//       subject,
//       message
//     });

//     await newMessage.save();

//     res.status(201).json({
//       _id: newMessage._id,
//       firstName,
//       lastName,
//       email,
//       phone,
//       subject,
//       message,
//       createdAt: newMessage.createdAt
//     });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to save the contact message' });
//   }
// };


const ContactMessage = require('../models/ContactMessage');
const resend = require('../config/resendClient');

exports.getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find();
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

exports.createContactMessage = async (req, res) => {
  const { firstName, lastName, email, phone, subject, message } = req.body;

  if (!firstName || !email || !subject || !message) {
    return res.status(400).json({ error: 'All required fields must be filled out' });
  }

  try {
    // 1. Save message to DB
    const newMessage = new ContactMessage({
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
    });

    await newMessage.save();

    // 2. Send email to admin
    await resend.emails.send({
      from: 'YuktinewUser@resend.dev',
      to: process.env.ADMIN_EMAIL,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h3>New Contact Message</h3>
        <p><strong>Name:</strong> ${firstName}${lastName ? ' ' + lastName : ''}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `,
    });

    // 3. Return success response
    res.status(201).json({
      _id: newMessage._id,
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
      createdAt: newMessage.createdAt,
    });
  } catch (err) {
    console.error('Error saving message or sending email:', err);
    res.status(500).json({ error: 'Failed to save the contact message and send email' });
  }
};
