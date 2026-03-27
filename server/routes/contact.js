const router = require('express').Router();
const ContactMessage = require('../models/ContactMessage');
const { authMiddleware: auth } = require('../middleware/auth');

// POST /api/contact - Submit contact message
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message, category } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Auto-detect category based on keywords
    let detectedCategory = category || 'general';
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('password') || lowerMessage.includes('reset')) {
      detectedCategory = 'password-reset';
    } else if (lowerMessage.includes('login') || lowerMessage.includes('access') || lowerMessage.includes('account')) {
      detectedCategory = 'account-access';
    } else if (lowerMessage.includes('error') || lowerMessage.includes('bug') || lowerMessage.includes('not working')) {
      detectedCategory = 'technical-issue';
    }

    // Auto-detect priority
    let priority = 'medium';
    if (lowerMessage.includes('urgent') || lowerMessage.includes('emergency') || lowerMessage.includes('asap')) {
      priority = 'urgent';
    } else if (lowerMessage.includes('important') || lowerMessage.includes('critical')) {
      priority = 'high';
    }

    const contactMessage = new ContactMessage({
      name,
      email,
      subject,
      message,
      category: detectedCategory,
      priority,
      autoReplySent: true, // Mark as sent (in production, send actual email)
    });

    await contactMessage.save();

    // In production, send auto-reply email here
    console.log('Auto-reply would be sent to:', email);
    console.log('Admin notification would be sent');

    res.status(201).json({ 
      message: 'Your message has been received. We will respond shortly.',
      ticketId: contactMessage._id
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/contact - Get all contact messages (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const messages = await ContactMessage.find(filter)
      .populate('respondedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/contact/:id - Get single message
router.get('/:id', auth, async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id)
      .populate('respondedBy', 'name email');

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(message);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/contact/:id/respond - Admin responds to message
router.patch('/:id/respond', auth, async (req, res) => {
  try {
    const { adminResponse, status } = req.body;

    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.adminResponse = adminResponse;
    message.status = status || 'resolved';
    message.respondedBy = req.user.id;
    message.respondedAt = new Date();

    await message.save();

    // In production, send email to user with admin response
    console.log('Response email would be sent to:', message.email);

    res.json({ message: 'Response sent successfully', data: message });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/contact/:id/status - Update message status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, priority } = req.body;

    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (status) message.status = status;
    if (priority) message.priority = priority;

    await message.save();

    res.json({ message: 'Status updated successfully', data: message });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/contact/:id - Delete message
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
