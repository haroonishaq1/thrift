const bcrypt = require('bcryptjs');
const { User, OTP } = require('../models/User');
const { Brand } = require('../models/Brand');
const { BrandOTP } = require('../models/BrandOTP');
const { generateToken, generateOTP, getOTPExpiry, formatResponse, isValidEmail } = require('../utils/helpers');
const { sendOTPEmail, sendWelcomeEmail } = require('../utils/emailService');

// User Registration
const register = async (req, res) => {
  try {
    console.log('🚀 Registration request received');
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
      const {
      first_name,
      last_name,
      username,
      email,
      password,
      age,
      gender,      country,
      city,
      university,
      course,
      phone,
      terms_accepted,
      marketing_consent
    } = req.body;    console.log('🔍 Extracted fields:', {
      first_name, last_name, username, email, age, gender, country, city, 
      university, course, phone
    });

    console.log('🔍 DEBUG: Individual field values:');
    console.log('  username:', username, typeof username);
    console.log('  age:', age, typeof age);
    console.log('  gender:', gender, typeof gender);
    console.log('  country:', country, typeof country);
    console.log('  city:', city, typeof city);    // Validation
    if (!first_name || !last_name || !email || !password || !university || !course || !phone) {
      console.log('❌ Validation failed - missing required fields');
      return res.status(400).json(
        formatResponse(false, 'All required fields must be provided')
      );
    }

    if (!isValidEmail(email)) {
      console.log('❌ Invalid email format');
      return res.status(400).json(
        formatResponse(false, 'Please provide a valid email address')
      );
    }

    if (password.length < 6) {
      return res.status(400).json(
        formatResponse(false, 'Password must be at least 6 characters long')
      );
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      if (existingUser.email_verified) {
        return res.status(400).json(
          formatResponse(false, 'An account with this email already exists')
        );      } else {
        // User exists but not verified, resend OTP
        const otpCode = generateOTP();
        const expiresAt = getOTPExpiry();
        
        await OTP.create({
          email,
          otp_code: otpCode,
          expires_at: expiresAt,
          type: 'registration'
        });
        await sendOTPEmail(email, otpCode, existingUser.first_name);
        
        return res.status(200).json(
          formatResponse(true, 'Account exists but not verified. New verification code sent to your email')        );
      }
    }
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);    // Create user
    const newUser = await User.create({
      first_name,
      last_name,
      username,
      email,
      password: hashedPassword,
      age: age ? parseInt(age) : null,
      gender,
      country,
      city,
      university,
      course,
      phone
    });

    // Generate and send OTP
    const otpCode = generateOTP();
    const expiresAt = getOTPExpiry();
    
    await OTP.create({
      email,
      otp_code: otpCode,
      expires_at: expiresAt,
      type: 'registration'
    });
    await sendOTPEmail(email, otpCode, first_name);

    console.log(`✅ User registered successfully: ${email}`);

    res.status(201).json(
      formatResponse(true, 'Registration successful! Please check your email for verification code', {
        userId: newUser.id,
        email: newUser.email,
        name: `${newUser.first_name} ${newUser.last_name}`
      })
    );

  } catch (error) {
    console.error('❌ Registration error:', error.message);
    res.status(500).json(
      formatResponse(false, 'Registration failed. Please try again later')
    );
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json(
        formatResponse(false, 'Email and OTP code are required')
      );
    }

    if (!isValidEmail(email)) {
      return res.status(400).json(
        formatResponse(false, 'Please provide a valid email address')
      );
    }

    if (otpCode.length !== 6) {
      return res.status(400).json(
        formatResponse(false, 'OTP code must be 6 digits')
      );
    }

    // Find valid OTP
    const validOTP = await OTP.findValid(email, otpCode, 'registration');
    if (!validOTP) {
      return res.status(400).json(
        formatResponse(false, 'Invalid or expired OTP code')
      );
    }

    // Mark OTP as used
    await OTP.markAsUsed(validOTP.id);

    // Update user email verification status
    const verifiedUser = await User.updateEmailVerification(email, true);
    if (!verifiedUser) {
      return res.status(404).json(
        formatResponse(false, 'User not found')
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: verifiedUser.id,
      email: verifiedUser.email
    });

    // Send welcome email
    await sendWelcomeEmail(email, verifiedUser.first_name);

    console.log(`✅ Email verified successfully: ${email}`);    res.status(200).json(
      formatResponse(true, 'Email verified successfully! Welcome to Project Thrift!', {
        token,
        user: {
          id: verifiedUser.id,
          first_name: verifiedUser.first_name,
          last_name: verifiedUser.last_name,
          username: verifiedUser.username,
          email: verifiedUser.email,
          age: verifiedUser.age,
          gender: verifiedUser.gender,
          country: verifiedUser.country,
          city: verifiedUser.city,
          university: verifiedUser.university,
          course: verifiedUser.course,
          phone: verifiedUser.phone,
          email_verified: verifiedUser.email_verified,
          created_at: verifiedUser.created_at
        }
      })
    );

  } catch (error) {
    console.error('❌ OTP verification error:', error.message);
    res.status(500).json(
      formatResponse(false, 'Verification failed. Please try again later')
    );
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(
        formatResponse(false, 'Email is required')
      );
    }

    if (!isValidEmail(email)) {
      return res.status(400).json(
        formatResponse(false, 'Please provide a valid email address')
      );
    }

    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json(
        formatResponse(false, 'No account found with this email address')
      );
    }

    if (user.email_verified) {
      return res.status(400).json(
        formatResponse(false, 'Email is already verified')
      );
    }

    // Generate and send new OTP
    const otpCode = generateOTP();
    const expiresAt = getOTPExpiry();
    
    await OTP.create({
      email,
      otp_code: otpCode,
      expires_at: expiresAt,
      type: 'registration'
    });
    await sendOTPEmail(email, otpCode, user.first_name);

    console.log(`✅ OTP resent successfully: ${email}`);

    res.status(200).json(
      formatResponse(true, 'New verification code sent to your email')
    );

  } catch (error) {
    console.error('❌ Resend OTP error:', error.message);
    res.status(500).json(
      formatResponse(false, 'Failed to resend verification code. Please try again later')
    );
  }
};

// User Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(
        formatResponse(false, 'Email and password are required')
      );
    }

    if (!isValidEmail(email)) {
      return res.status(400).json(
        formatResponse(false, 'Please provide a valid email address')
      );
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json(
        formatResponse(false, 'Invalid email or password')
      );
    }

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(401).json(
        formatResponse(false, 'Please verify your email before logging in')
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json(
        formatResponse(false, 'Invalid email or password')
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    console.log(`✅ User logged in successfully: ${email}`);    res.status(200).json(
      formatResponse(true, 'Login successful', {
        token,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          username: user.username || user.email.split('@')[0], // fallback username
          age: user.age,
          gender: user.gender,
          country: user.country,
          city: user.city,
          university: user.university,
          course: user.course,
          graduation_year: user.graduation_year,
          student_id: user.student_id,
          phone: user.phone,
          email_verified: user.email_verified,
          terms_accepted: user.terms_accepted,
          marketing_consent: user.marketing_consent
        }
      })
    );

  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json(
      formatResponse(false, 'Login failed. Please try again later')
    );
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json(
        formatResponse(false, 'User not found')
      );
    }

    res.status(200).json(
      formatResponse(true, 'Profile retrieved successfully', {
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          university: user.university,
          course: user.course,
          graduationYear: user.graduation_year,
          studentId: user.student_id,
          phone: user.phone,
          emailVerified: user.email_verified,
          createdAt: user.created_at
        }
      })
    );

  } catch (error) {
    console.error('❌ Get profile error:', error.message);
    res.status(500).json(
      formatResponse(false, 'Failed to retrieve profile')
    );
  }
};

// Brand Registration (simplified for demo)
const brandRegister = async (req, res) => {
  try {
    console.log('🚀 Brand registration request received');
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
    
    const {
      name,
      email,
      password,
      description,
      website,
      logo,
      adminUsername,
      adminEmail,
      category,
      country,
      phoneNumber
    } = req.body;

    // Validation
    if (!name || !email || !password || !adminUsername || !category || !country || !website) {
      console.log('❌ Validation failed - missing required fields');
      return res.status(400).json(
        formatResponse(false, 'All required fields must be provided', {
          required: ['name', 'email', 'password', 'adminUsername', 'category', 'country', 'website']
        })
      );
    }

    if (!isValidEmail(email)) {
      console.log('❌ Invalid email format');
      return res.status(400).json(
        formatResponse(false, 'Please provide a valid email address')
      );
    }

    if (password.length < 6) {
      return res.status(400).json(
        formatResponse(false, 'Password must be at least 6 characters long')
      );
    }

    // Check if brand already exists
    const existingBrand = await Brand.findByEmail(email.toLowerCase());
    if (existingBrand) {
      return res.status(409).json(
        formatResponse(false, 'A brand with this email already exists')
      );
    }

    // Store brand data temporarily for OTP verification
    const brandData = {
      name,
      email: email.toLowerCase(),
      password,
      website,
      adminUsername,
      adminEmail: adminEmail || email.toLowerCase(),
      description: description || '',
      category,
      country,
      phoneNumber: phoneNumber || ''
    };

    // Generate and send OTP
    const otpCode = generateOTP();
    const expiresAt = getOTPExpiry();
    
    await BrandOTP.create(email.toLowerCase(), otpCode, expiresAt, brandData);
    await sendOTPEmail(email.toLowerCase(), otpCode, name);

    console.log('✅ Brand registration OTP sent');
    console.log('📧 Brand email:', email);
    console.log('� OTP generated and email sent');

    return res.status(200).json(
      formatResponse(true, 'Registration initiated! Please check your email for verification code', {
        email: email.toLowerCase(),
        brandName: name,
        message: 'A 6-digit verification code has been sent to your email'
      })
    );

  } catch (error) {
    console.error('❌ Brand registration error:', error);
    return res.status(500).json(
      formatResponse(false, 'Registration failed. Please try again later.')
    );
  }
};

// Verify Brand OTP and Complete Registration
const verifyBrandOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json(
        formatResponse(false, 'Email and OTP code are required')
      );
    }

    if (!isValidEmail(email)) {
      return res.status(400).json(
        formatResponse(false, 'Please provide a valid email address')
      );
    }

    console.log(`🔍 Verifying brand OTP for: ${email}`);

    // Find OTP record
    const otpRecord = await BrandOTP.findByEmailAndCode(email.toLowerCase(), otpCode);

    if (!otpRecord) {
      console.log('❌ Invalid OTP or email');
      return res.status(400).json(
        formatResponse(false, 'Invalid or expired verification code')
      );
    }

    // Check if OTP is expired
    const now = new Date();
    const expiresAt = new Date(otpRecord.expires_at);

    if (now > expiresAt) {
      console.log('❌ OTP expired');
      return res.status(400).json(
        formatResponse(false, 'Verification code has expired. Please request a new one.')
      );
    }

    // Mark OTP as used
    await BrandOTP.markAsUsed(otpRecord.id);

    // Get brand data from OTP record
    console.log('🔍 OTP Record brand_data type:', typeof otpRecord.brand_data);
    console.log('🔍 OTP Record brand_data value:', otpRecord.brand_data);
    
    let brandData;
    try {
      // Check if brand_data is already an object (JSONB from PostgreSQL)
      if (typeof otpRecord.brand_data === 'object' && otpRecord.brand_data !== null) {
        brandData = otpRecord.brand_data;
      } else {
        // If it's a string, parse it
        brandData = JSON.parse(otpRecord.brand_data);
      }
    } catch (parseError) {
      console.error('❌ Error parsing brand data:', parseError.message);
      console.error('❌ Brand data value:', otpRecord.brand_data);
      return res.status(500).json(
        formatResponse(false, 'Error processing registration data. Please try again.')
      );
    }

    // Create brand in database (now with verified email)
    const newBrand = await Brand.create(brandData);

    console.log('✅ Brand OTP verified and brand registered successfully');
    console.log('📧 Brand email:', email);
    console.log('📋 Brand added to pending approval queue');

    return res.status(201).json(
      formatResponse(true, 'Email verified and brand registration submitted successfully! Your application is pending admin approval. You will be notified once approved.', {
        brand: {
          id: newBrand.id,
          name: newBrand.name,
          email: newBrand.email,
          adminUsername: newBrand.admin_username,
          status: 'pending_approval'
        }
      })
    );

  } catch (error) {
    console.error('❌ Brand OTP verification error:', error);
    return res.status(500).json(
      formatResponse(false, 'Verification failed. Please try again later.')
    );
  }
};

// Resend Brand OTP
const resendBrandOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json(
        formatResponse(false, 'Valid email is required')
      );
    }

    console.log(`🔄 Resending brand OTP for: ${email}`);

    // Check if there's a recent OTP request
    const existingOTP = await BrandOTP.getLatestByEmail(email.toLowerCase());

    if (!existingOTP) {
      return res.status(404).json(
        formatResponse(false, 'No pending verification found for this email')
      );
    }

    // Check if the latest OTP is still valid (within 1 minute)
    const now = new Date();
    const createdAt = new Date(existingOTP.created_at);
    const timeDiff = (now - createdAt) / 1000; // seconds

    if (timeDiff < 60) {
      return res.status(429).json(
        formatResponse(false, 'Please wait before requesting a new code')
      );
    }

    // Generate new OTP
    const otpCode = generateOTP();
    const expiresAt = getOTPExpiry();
    
    let brandData;
    try {
      // Check if brand_data is already an object (JSONB from PostgreSQL)
      if (typeof existingOTP.brand_data === 'object' && existingOTP.brand_data !== null) {
        brandData = existingOTP.brand_data;
      } else {
        // If it's a string, parse it
        brandData = JSON.parse(existingOTP.brand_data);
      }
    } catch (parseError) {
      console.error('❌ Error parsing existing brand data:', parseError.message);
      return res.status(500).json(
        formatResponse(false, 'Error processing resend request. Please try again.')
      );
    }

    // Create new OTP record
    await BrandOTP.create(email.toLowerCase(), otpCode, expiresAt, brandData);

    // Send OTP email
    await sendOTPEmail(email.toLowerCase(), otpCode, brandData.name);

    console.log('✅ Brand OTP resent successfully');

    return res.json(
      formatResponse(true, 'New verification code sent to your email', {
        email: email.toLowerCase()
      })
    );

  } catch (error) {
    console.error('❌ Resend brand OTP error:', error);
    return res.status(500).json(
      formatResponse(false, 'Failed to resend verification code')
    );
  }
};

// Brand Login
const brandLogin = async (req, res) => {
  try {
    console.log('🚀 Brand login request received');
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json(
        formatResponse(false, 'Email and password are required')
      );
    }

    if (!isValidEmail(email)) {
      return res.status(400).json(
        formatResponse(false, 'Please provide a valid email address')
      );
    }

    // Use Brand model to verify credentials and check approval status
    const verificationResult = await Brand.verifyCredentials(email.toLowerCase(), password);

    if (!verificationResult.valid) {
      console.log('❌ Brand login failed:', verificationResult.message);
      return res.status(401).json(
        formatResponse(false, verificationResult.message)
      );
    }

    console.log('✅ Brand login successful - approved brand');

    // Generate token
    const token = generateToken({ 
      id: verificationResult.brand.id, 
      email: verificationResult.brand.email,
      type: 'brand'
    });

    return res.json(
      formatResponse(true, 'Login successful', {
        brand: {
          id: verificationResult.brand.id,
          name: verificationResult.brand.name,
          email: verificationResult.brand.email,
          adminUsername: verificationResult.brand.adminUsername,
          adminEmail: verificationResult.brand.adminEmail,
          status: 'approved'
        },
        token
      })
    );

  } catch (error) {    console.error('❌ Brand login error:', error);
    return res.status(500).json(
      formatResponse(false, 'Login failed. Please try again later.')
    );
  }
};

// Forgot Password - Send Reset Code
const forgotPassword = async (req, res) => {
  try {
    console.log('🔓 Forgot password request received');
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(
        formatResponse(false, 'Email is required')
      );
    }

    if (!isValidEmail(email)) {
      return res.status(400).json(
        formatResponse(false, 'Please provide a valid email address')
      );
    }

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (!existingUser) {
      return res.status(404).json(
        formatResponse(false, 'Email is not registered with us')
      );
    }

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = getOTPExpiry();

    // Delete any existing forgot password OTPs for this user
    await OTP.deleteByEmail(email, 'forgot_password');

    // Store OTP in database with type 'forgot_password'
    await OTP.create({
      email,
      otp_code: otpCode,
      expires_at: expiresAt,
      type: 'forgot_password'
    });

    // Send OTP email
    await sendOTPEmail(email, otpCode, 'Password Reset');

    console.log('✅ Forgot password OTP sent successfully');
    return res.json(
      formatResponse(true, 'Password reset code sent to your email')
    );

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    return res.status(500).json(
      formatResponse(false, 'Failed to send reset code. Please try again later.')
    );
  }
};

// Verify Forgot Password OTP
const verifyForgotPasswordOTP = async (req, res) => {
  try {
    console.log('🔓 Verify forgot password OTP request received');
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json(
        formatResponse(false, 'Email and OTP code are required')
      );
    }

    // Find OTP record
    const otpRecord = await OTP.findByEmailAndCode(email, otpCode, 'forgot_password');
    
    if (!otpRecord) {
      return res.status(400).json(
        formatResponse(false, 'Invalid or expired reset code')
      );
    }

    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      await OTP.deleteByEmail(email, 'forgot_password');
      return res.status(400).json(
        formatResponse(false, 'Reset code has expired. Please request a new one.')
      );
    }

    // Generate a temporary reset token
    const resetToken = generateToken({ 
      email, 
      type: 'password_reset',
      timestamp: Date.now()
    });

    // Delete the OTP since it's been verified
    await OTP.deleteByEmail(email, 'forgot_password');

    console.log('✅ Forgot password OTP verified successfully');
    return res.json(
      formatResponse(true, 'Reset code verified successfully', {
        resetToken
      })
    );

  } catch (error) {
    console.error('❌ Verify forgot password OTP error:', error);
    return res.status(500).json(
      formatResponse(false, 'Verification failed. Please try again later.')
    );
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    console.log('🔓 Reset password request received');
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json(
        formatResponse(false, 'Email, reset token, and new password are required')
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json(
        formatResponse(false, 'Password must be at least 8 characters long')
      );
    }

    // Verify reset token (this is a simple verification, you can make it more robust)
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
      
      if (decoded.email !== email || decoded.type !== 'password_reset') {
        throw new Error('Invalid token');
      }

      // Check if token is too old (15 minutes)
      const tokenAge = Date.now() - decoded.timestamp;
      if (tokenAge > 15 * 60 * 1000) { // 15 minutes in milliseconds
        throw new Error('Token expired');
      }
    } catch (tokenError) {
      return res.status(400).json(
        formatResponse(false, 'Invalid or expired reset token')
      );
    }

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (!existingUser) {
      return res.status(404).json(
        formatResponse(false, 'User not found')
      );
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    await User.updatePassword(email, hashedPassword);

    console.log('✅ Password reset successful');
    return res.json(
      formatResponse(true, 'Password reset successful')
    );

  } catch (error) {
    console.error('❌ Reset password error:', error);
    return res.status(500).json(
      formatResponse(false, 'Failed to reset password. Please try again later.')
    );
  }
};

module.exports = {
  register,
  verifyOTP,
  resendOTP,
  login,
  getProfile,
  brandRegister,
  verifyBrandOTP,
  brandLogin,
  resendBrandOTP,
  forgotPassword,
  verifyForgotPasswordOTP,
  resetPassword
};
