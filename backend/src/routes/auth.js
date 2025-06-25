const express = require('express');
const router = express.Router();
const {
  register,
  verifyOTP,
  resendOTP,
  login,
  getProfile,
  brandRegister,
  forgotPassword,
  verifyForgotPasswordOTP,
  resetPassword
} = require('../controllers/authController');
const {
  validateRegistration,
  validateOTPVerification,
  validateResendOTP,
  validateLogin
} = require('../middleware/validation');
const { authenticateToken, requireVerified } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Public routes
router.post('/register', validateRegistration, asyncHandler(register));
router.post('/verify-otp', validateOTPVerification, asyncHandler(verifyOTP));
router.post('/resend-otp', validateResendOTP, asyncHandler(resendOTP));
router.post('/login', validateLogin, asyncHandler(login));

// Forgot Password routes
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/verify-forgot-password-otp', asyncHandler(verifyForgotPasswordOTP));
router.post('/reset-password', asyncHandler(resetPassword));

// Brand routes (also available at /brand-auth/register via alias)
router.post('/brand/register', asyncHandler(brandRegister));

// Protected routes
router.get('/profile', authenticateToken, requireVerified, asyncHandler(getProfile));

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
