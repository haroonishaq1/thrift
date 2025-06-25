const express = require('express');
const router = express.Router();
const { brandRegister, brandLogin, verifyBrandOTP, resendBrandOTP } = require('../controllers/authController');
const { asyncHandler } = require('../middleware/errorHandler');

// Brand auth routes - these are the exact routes the frontend expects
router.post('/register', asyncHandler(brandRegister));
router.post('/verify-otp', asyncHandler(verifyBrandOTP));
router.post('/resend-otp', asyncHandler(resendBrandOTP));
router.post('/login', asyncHandler(brandLogin));

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Brand auth service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
