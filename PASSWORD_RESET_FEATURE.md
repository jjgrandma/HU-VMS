# Password Reset & Support Feature

## Overview
Complete password reset flow with admin support contact has been implemented for the University Vehicle Management System.

## Features Implemented

### 1. Login Page Updates
- ✅ Removed role selection (users login with username/password only)
- ✅ Added functional "Forgot Password?" link
- ✅ Added "Need Support?" section with admin contact
- ✅ Email link to admin support: admin@haramaya.edu.et

### 2. Forgot Password Page
**Route:** `/forgot-password`

Features:
- Clean, professional UI matching university system design
- Email/Username input field
- Email validation
- Loading states
- Success message with confirmation
- Error handling for invalid emails
- "Back to Login" link

### 3. Reset Password Page
**Route:** `/reset-password/:token`

Features:
- Secure token-based password reset
- Password strength indicator (Weak/Medium/Strong)
- Real-time password requirements validation:
  - Minimum 8 characters
  - One uppercase letter
  - One lowercase letter
  - One number
  - One special character
- Show/hide password toggle
- Confirm password matching
- Token expiration handling
- Auto-redirect to login after success

### 4. Backend API Endpoints

#### POST /api/auth/forgot-password
- Accepts email or username
- Generates secure reset token
- Token expires in 1 hour
- Returns reset URL (logged in console for development)

#### GET /api/auth/verify-reset-token/:token
- Validates reset token
- Checks expiration

#### POST /api/auth/reset-password
- Accepts token and new password
- Updates user password
- Clears reset token

#### POST /api/auth/login (Updated)
- Role parameter is now optional
- Users can login with just username/password
- System determines role from database

### 5. Database Updates
User model now includes:
- `resetPasswordToken`: Hashed token for password reset
- `resetPasswordExpires`: Token expiration timestamp

## User Flow

### Forgot Password Flow:
1. User clicks "Forgot Password?" on login page
2. Enters email or username
3. Receives success message
4. Admin sees reset URL in server console (in development)
5. User clicks reset link from email (in production)
6. Enters new password with validation
7. Password is reset successfully
8. Auto-redirected to login page

### Support Flow:
1. User clicks "Contact Admin Support" on login page
2. Opens email client with admin email pre-filled
3. User describes their issue
4. Admin assists with account access

## Security Features
- Tokens are hashed using SHA-256
- Tokens expire after 1 hour
- Passwords are hashed with bcrypt
- Strong password requirements enforced
- Token validation before password reset

## Development Notes
- Reset URLs are logged to console in development
- In production, integrate with email service (SendGrid, AWS SES, etc.)
- Admin email: admin@haramaya.edu.et (update as needed)

## Testing
1. Start both servers (frontend & backend)
2. Navigate to login page
3. Click "Forgot Password?"
4. Enter a valid username/email
5. Check server console for reset URL
6. Copy URL and paste in browser
7. Set new password
8. Login with new credentials

## Files Modified/Created

### Frontend:
- `src/pages/auth/Login.jsx` - Added support link, removed role
- `src/pages/auth/login.css` - Added support section styles
- `src/pages/auth/ForgotPassword.jsx` - New component
- `src/pages/auth/forgotPassword.css` - New styles
- `src/pages/auth/ResetPassword.jsx` - New component
- `src/pages/auth/resetPassword.css` - New styles
- `src/App.jsx` - Added new routes
- `src/api/api.js` - Updated login function

### Backend:
- `server/models/User.js` - Added reset token fields
- `server/routes/auth.js` - Added password reset endpoints

## Future Enhancements
- Email integration for sending reset links
- OTP alternative option
- Rate limiting for forgot password requests
- Admin dashboard for password reset requests
- SMS notification option
