# Admin Password Reset & Support Management Guide

## Overview
Complete admin dashboard for managing password reset requests and support messages from users who are having trouble accessing the system.

---

## Features

### 1. Password Reset Management
Admins can view and manage all password reset requests from users.

**Access:** Admin Dashboard → Password & Support

#### Features:
- View all users with pending password reset requests
- See token expiration times
- Send new reset links to users
- Manually reset passwords with temporary credentials
- Track request status (pending, active, expired, resolved)

#### Actions Available:
1. **Send Reset Link**
   - Generates a new password reset token
   - Creates a reset URL valid for 1 hour
   - URL is logged to console (in development)
   - In production, would be sent via email

2. **Reset Password**
   - Admin can set a temporary password for the user
   - User receives temporary password
   - User should change it after first login

---

### 2. Support Message Management
Admins can view and respond to support requests from users.

**Access:** Admin Dashboard → Password & Support → Support Messages Tab

#### Features:
- View all support messages (pending and resolved)
- See user details (name, email, username, role, department)
- Read full message content
- Send responses to users
- Track message status
- View previous responses

#### Support Message Details:
- User information
- Message content
- Submission timestamp
- Current status
- Response history

#### Actions Available:
1. **Send Response**
   - Type a response message
   - Response is logged to console (in development)
   - In production, would be sent via email
   - Message status changes to "resolved"

2. **Send Reset Link**
   - Quick action to send password reset link
   - Useful when user's issue is password-related

---

## User Flow

### For Users Having Login Issues:

1. **Go to Login Page**
   - User sees "Forgot Password?" link
   - User sees "Contact Admin Support" link

2. **Option 1: Forgot Password**
   - Click "Forgot Password?"
   - Enter email or username
   - Receive reset link (via email in production)
   - Click link and set new password

3. **Option 2: Contact Support**
   - Click "Contact Admin Support"
   - Fill out support form:
     - Full Name
     - Email Address
     - Username
     - Describe the issue
   - Submit request
   - Wait for admin response (within 24 hours)

---

## Admin Workflow

### Handling Password Reset Requests:

1. **Navigate to Password & Support**
   - From admin sidebar, click "Password & Support"
   - View "Password Reset Requests" tab

2. **Review Requests**
   - See all users with pending resets
   - Check token expiration times
   - View user details

3. **Take Action**
   - **Option A:** Send Reset Link
     - Click "Send Reset Link" button
     - Copy URL from console
     - Send to user via email/phone
   
   - **Option B:** Reset Password Manually
     - Click "Reset Password" button
     - Enter temporary password
     - Share temporary password with user securely
     - Instruct user to change password after login

### Handling Support Messages:

1. **Navigate to Support Messages Tab**
   - Click "Support Messages" tab
   - See list of all messages (pending first)

2. **Select a Message**
   - Click on a message to view details
   - Read full message content
   - Review user information

3. **Respond to User**
   - Type response in text area
   - Click "Send Response"
   - Response is sent to user's email (in production)
   - Message status changes to "resolved"

4. **Quick Actions**
   - If issue is password-related, click "Send Reset Link"
   - This generates a reset link for the user

---

## API Endpoints

### User Endpoints:
- `POST /api/auth/forgot-password` - Request password reset
- `GET /api/auth/verify-reset-token/:token` - Verify reset token
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/submit-support` - Submit support request

### Admin Endpoints (Requires Admin Auth):
- `GET /api/auth/password-reset-requests` - Get all reset requests
- `GET /api/auth/support-messages` - Get all support messages
- `POST /api/auth/admin-send-reset-link` - Generate reset link for user
- `POST /api/auth/admin-reset-password` - Reset user password directly
- `POST /api/auth/respond-support` - Respond to support message

---

## Database Models

### User Model (Updated):
```javascript
{
  name: String,
  username: String,
  email: String,
  password: String (hashed),
  role: String,
  resetPasswordToken: String (hashed),
  resetPasswordExpires: Date,
  // ... other fields
}
```

### SupportMessage Model (New):
```javascript
{
  user: ObjectId (ref: User),
  name: String,
  email: String,
  username: String,
  role: String,
  department: String,
  subject: String,
  message: String,
  status: String (pending/resolved),
  response: String,
  respondedBy: ObjectId (ref: User),
  respondedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Security Features

1. **Token Security**
   - Tokens are hashed using SHA-256 before storage
   - Tokens expire after 1 hour
   - One-time use tokens

2. **Admin Authentication**
   - All admin endpoints require authentication
   - Role-based access control (ADMIN only)
   - JWT token validation

3. **Password Security**
   - Passwords hashed with bcrypt
   - Minimum password requirements enforced
   - Strong password validation on reset

---

## Development vs Production

### Development Mode:
- Reset URLs logged to console
- Support responses logged to console
- No email sending required

### Production Mode:
To enable for production:

1. **Email Integration**
   - Install email service (e.g., nodemailer)
   - Configure SMTP settings
   - Update endpoints to send emails

2. **Example Email Setup:**
```javascript
// In auth.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send reset email
await transporter.sendMail({
  from: 'noreply@haramaya.edu.et',
  to: user.email,
  subject: 'Password Reset Request',
  html: `<p>Click here to reset: ${resetUrl}</p>`
});
```

---

## Testing Guide

### Test Password Reset:
1. Go to login page
2. Click "Forgot Password?"
3. Enter username: `admin`
4. Check server console for reset URL
5. Copy URL and paste in browser
6. Set new password
7. Login with new password

### Test Support Request:
1. Go to login page
2. Click "Contact Admin Support"
3. Fill out form
4. Submit request
5. Login as admin
6. Go to Password & Support
7. Click Support Messages tab
8. Select the message
9. Send a response
10. Check console for response log

### Test Admin Actions:
1. Login as admin
2. Go to Password & Support
3. View reset requests
4. Click "Send Reset Link" for a user
5. Check console for URL
6. Try "Reset Password" action
7. Enter temporary password
8. Test login with temporary password

---

## Troubleshooting

### Issue: Reset link not working
- Check if token has expired (1 hour limit)
- Verify token in URL matches database
- Generate new reset link from admin panel

### Issue: Support messages not showing
- Verify user submitted form correctly
- Check database for SupportMessage documents
- Ensure admin is authenticated

### Issue: Can't send reset link
- Verify user exists in database
- Check admin authentication
- Review server console for errors

---

## Future Enhancements

1. **Email Integration**
   - Automated email sending
   - Email templates
   - Email delivery tracking

2. **SMS Notifications**
   - SMS-based password reset
   - OTP verification
   - SMS alerts for admins

3. **Analytics Dashboard**
   - Track reset request trends
   - Support message metrics
   - Response time tracking

4. **Automated Responses**
   - Template responses
   - FAQ auto-replies
   - Chatbot integration

5. **User Self-Service**
   - Security questions
   - Account recovery options
   - Profile verification

---

## Contact

For technical support or questions about this feature:
- Email: admin@haramaya.edu.et
- System: University Vehicle Management System
- Version: 1.0.0
