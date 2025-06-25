const bcrypt = require('bcryptjs');
const { generateToken, formatResponse, isValidEmail } = require('../utils/helpers');

// Mock brand data storage (replace with actual database in production)
let brands = [];
let brandCounter = 1;

// Brand Registration
const register = async (req, res) => {
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
      category,
      country,
      phoneNumber
    } = req.body;

    console.log('🔍 Extracted fields:', {
      name, email, adminUsername, category, country, website
    });

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
    const existingBrand = brands.find(brand => 
      brand.email.toLowerCase() === email.toLowerCase() || 
      brand.adminUsername.toLowerCase() === adminUsername.toLowerCase()
    );

    if (existingBrand) {
      console.log('❌ Brand already exists');
      return res.status(400).json(
        formatResponse(false, 'Brand with this email or admin username already exists')
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create brand object
    const newBrand = {
      id: brandCounter++,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      description: description || '',
      website,
      logo: logo || '',
      adminUsername,
      category,
      country,
      phoneNumber: phoneNumber || '',
      verified: true, // Auto-verify for demo purposes
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store brand
    brands.push(newBrand);

    console.log('✅ Brand registered successfully');
    console.log('📧 Brand email:', email);

    // Generate token
    const token = generateToken({ 
      id: newBrand.id, 
      email: newBrand.email,
      type: 'brand'
    });

    // Remove password from response
    const brandResponse = { ...newBrand };
    delete brandResponse.password;

    return res.status(201).json(
      formatResponse(true, 'Brand registered successfully', {
        brand: brandResponse,
        token
      })
    );

  } catch (error) {
    console.error('❌ Brand registration error:', error);
    return res.status(500).json(
      formatResponse(false, 'Registration failed. Please try again later.')
    );
  }
};

// Brand Login
const login = async (req, res) => {
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

    // Find brand
    const brand = brands.find(b => b.email.toLowerCase() === email.toLowerCase());

    if (!brand) {
      console.log('❌ Brand not found');
      return res.status(400).json(
        formatResponse(false, 'Invalid email or password')
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, brand.password);

    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(400).json(
        formatResponse(false, 'Invalid email or password')
      );
    }

    // Check if brand is verified
    if (!brand.verified) {
      return res.status(400).json(
        formatResponse(false, 'Please verify your brand account first')
      );
    }

    console.log('✅ Brand login successful');

    // Generate token
    const token = generateToken({ 
      id: brand.id, 
      email: brand.email,
      type: 'brand'
    });

    // Remove password from response
    const brandResponse = { ...brand };
    delete brandResponse.password;

    return res.json(
      formatResponse(true, 'Login successful', {
        brand: brandResponse,
        token
      })
    );

  } catch (error) {
    console.error('❌ Brand login error:', error);
    return res.status(500).json(
      formatResponse(false, 'Login failed. Please try again later.')
    );
  }
};

// Get Brand Profile
const getProfile = async (req, res) => {
  try {
    const brandId = req.user.id;
    const brand = brands.find(b => b.id === brandId);

    if (!brand) {
      return res.status(404).json(
        formatResponse(false, 'Brand not found')
      );
    }

    // Remove password from response
    const brandResponse = { ...brand };
    delete brandResponse.password;

    return res.json(
      formatResponse(true, 'Brand profile retrieved successfully', {
        brand: brandResponse
      })
    );

  } catch (error) {
    console.error('❌ Get brand profile error:', error);
    return res.status(500).json(
      formatResponse(false, 'Failed to get brand profile')
    );
  }
};

// Logout (client-side token removal)
const logout = async (req, res) => {
  try {
    return res.json(
      formatResponse(true, 'Logged out successfully')
    );
  } catch (error) {
    console.error('❌ Brand logout error:', error);
    return res.status(500).json(
      formatResponse(false, 'Logout failed')
    );
  }
};

// Forgot Password (placeholder)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json(
        formatResponse(false, 'Please provide a valid email address')
      );
    }

    // In a real implementation, you would send a password reset email
    return res.json(
      formatResponse(true, 'Password reset email sent (feature not implemented in demo)')
    );

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    return res.status(500).json(
      formatResponse(false, 'Failed to process password reset request')
    );
  }
};

// Reset Password (placeholder)
const resetPassword = async (req, res) => {
  try {
    return res.json(
      formatResponse(true, 'Password reset successful (feature not implemented in demo)')
    );
  } catch (error) {
    console.error('❌ Reset password error:', error);
    return res.status(500).json(
      formatResponse(false, 'Failed to reset password')
    );
  }
};

module.exports = {
  register,
  login,
  getProfile,
  logout,
  forgotPassword,
  resetPassword
};
