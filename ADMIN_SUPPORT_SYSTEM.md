# Admin Support & Password Reset Management System

## Overview
Complete admin management system for handling user support requests, contact messages, and password reset monitoring.

## Features

### 1. Automated Password Reset System
- **User Flow:**
  - User clicks "Forgot Password?" on login page
  - Enters email or username
  - System generates secure token (expires in 1 hour)
  - Reset link sent (logged in console for development)
  - User sets new password with validation
  - Auto-redirect to login

- **Admin Monitoring:**
  - View all password reset requests
  - Filter by status (pending, completed, expired)
  - See user details, timestamps, IP addresses
  - Track completion rates

### 2. Contact Support System
- **User Flow:**
  - Click "Contact Admin Support" on login page
  - Fill out contact form with:
    - Name
    - Email
    - Category (auto-detected from keywords)
    - Subject
    - Message
  - Receive instant confirmation
  - Auto-reply email sent (in production)

- **Admin Management:**
  - View all contact messages
  - Filter by status, priority, category
  - Respond directly to users
  - Update message status
  - Delete resolved messages
  - Track response times

### 3. Smart Features

#### Auto-Detection
Messages are automatically categorized based on keywords:
- "password" or "reset" → Password Reset category
- "login" or "access" or "account" → Account Access category
- "error" or "bug" or "not working" → Technical Issue category

#### Auto-Priority
Priority is automatically assigned:
- "urgent" or "emergency" or "asap" → Urgent priority
- "important" or "critical" → High priority
- Default → Medium priority

## Admin Pages

### Contact Messages (`/admin/contact-messages`)
**Features:**
- Dashboard with statistics (Total, Pending, In Progress, Resolved)
- Filter by status, priority, and category
- View full message details
- Respond to messages inline
- Update status (Pending → In Progress → Resolved)
- Delete messages
- See admin response history

**Actions:**
- Click "Respond" to reply to a message
- Select status from dropdown to update
- Click trash icon to delete

### Password Reset Management (`/admin/password-reset-management`)
**Features:**
- Dashboard with statistics (Total, Pending, Completed, Expired)
- Filter by status
- View all reset requests with:
  - User name and email
  - Request timestamp
  - Expiration time
  - Completion status
  - IP address
- Color-coded status badges
- Expired token highlighting

## API Endpoints

### Contact Messages
```
POST   /api/contact              - Submit contact message
GET    /api/contact              - Get all messages (Admin)
GET    /api/contact/:id          - Get single message
PATCH  /api/contact/:id/respond  - Admin responds to message
PATCH  /api/contact/:id/status   - Update message status
DELETE /api/contact/:id          - Delete message
```

### Password Reset
```
POST   /api/auth/forgot-password       - Request password reset
GET    /api/auth/verify-reset-token/:token - Verify token
POST   /api/auth/reset-password        - Reset password
GET    /api/auth/reset-logs            - Get reset logs (Admin)
```

## Database Models

### ContactMessage
```javascript
{
  name: String,
  email: String,
  subject: String,
  message: String,
  status: 'pending' | 'in-progress' | 'resolved',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  category: 'password-reset' | 'account-access' | 'technical-issue' | 'general' | 'other',
  adminResponse: String,
  respondedBy: ObjectId (User),
  respondedAt: Date,
  autoReplySent: Boolean,
  timestamps: true
}
```

### PasswordResetLog
```javascript
{
  user: ObjectId (User),
  requestedAt: Date,
  token: String (hashed),
  tokenExpires: Date,
  status: 'pending' | 'completed' | 'expired' | 'cancelled',
  completedAt: Date,
  ipAddress: String,
  userAgent: String,
  timestamps: true
}
```

## Security Features

### Password Reset
- Tokens hashed with SHA-256
- 1-hour expiration
- One-time use only
- IP address logging
- User agent tracking

### Contact Messages
- Input validation
- XSS protection
- Rate limiting (recommended for production)
- Admin authentication required

## Admin Access

### Navigation
1. Login as Admin
2. Sidebar → "Support & Security" dropdown
3. Choose:
   - "Contact Messages" - Manage user inquiries
   - "Password Reset Logs" - Monitor reset requests

### Responding to Messages
1. Go to Contact Messages page
2. Find the message
3. Click "Respond" button
4. Type your response
5. Click "Send Response"
6. Status automatically updates to "Resolved"
7. User receives email with response (in production)

### Monitoring Password Resets
1. Go to Password Reset Management
2. View all reset requests
3. Filter by status if needed
4. Check for suspicious activity
5. Monitor completion rates

## Production Setup

### Email Integration
To enable email sending in production:

1. Install nodemailer:
```bash
cd server
npm install nodemailer
```

2. Configure email in `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@haramaya.edu.et
```

3. Create email service (`server/utils/emailService.js`):
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendPasswordResetEmail = async (email, resetUrl) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link expires in 1 hour.</p>
    `
  });
};

exports.sendContactAutoReply = async (email, name) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'We received your message',
    html: `
      <h2>Thank you for contacting us</h2>
      <p>Hello ${name},</p>
      <p>We have received your message and will respond shortly.</p>
      <p>- Haramaya University Transport System</p>
    `
  });
};

exports.sendAdminResponse = async (email, name, response) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Response to your inquiry',
    html: `
      <h2>Response from Admin</h2>
      <p>Hello ${name},</p>
      <p>${response}</p>
      <p>- Haramaya University Transport System</p>
    `
  });
};
```

4. Update routes to use email service

## Statistics & Insights

### Contact Messages Dashboard
- Total messages received
- Pending messages count
- In-progress messages count
- Resolved messages count
- Average response time (can be added)

### Password Reset Dashboard
- Total reset requests
- Pending resets
- Completed resets
- Expired tokens
- Success rate (can be calculated)

## Best Practices

### For Admins
1. Respond to urgent messages within 1 hour
2. Check contact messages daily
3. Monitor password reset logs for suspicious activity
4. Keep responses professional and helpful
5. Update message status as you work on them
6. Delete resolved messages periodically

### For System Maintenance
1. Set up email service for production
2. Configure rate limiting
3. Monitor server logs
4. Back up contact messages
5. Review password reset patterns
6. Update auto-reply templates as needed

## Troubleshooting

### Users not receiving reset emails
- Check server console for reset URL (development)
- Verify email service configuration (production)
- Check spam folder
- Verify user email is correct

### Contact form not submitting
- Check network connection
- Verify API endpoint is running
- Check browser console for errors
- Ensure all required fields are filled

### Admin can't see messages
- Verify admin is logged in
- Check user role is 'ADMIN'
- Verify API authentication token
- Check server logs for errors

## Future Enhancements
- Email templates with branding
- SMS notifications option
- Live chat integration
- Ticket system with tracking numbers
- Auto-response templates based on keywords
- Analytics dashboard
- Export contact messages to CSV
- Scheduled reports for admins
- User satisfaction ratings
- Knowledge base integration
