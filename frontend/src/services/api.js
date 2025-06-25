// Import auth utilities
import { getUserToken } from '../utils/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Generic API request function
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = getUserToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Admin API request function with admin token
 */
const adminApiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add admin token if available
  const adminToken = localStorage.getItem('adminToken');
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Admin API request failed:', error);
    throw error;
  }
};

/**
 * Authentication API functions
 */
export const authAPI = {
  // Register new user
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  // Verify OTP
  verifyOTP: async (email, otp) => {
    return apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otpCode: otp }),
    });
  },

  // Resend OTP
  resendOTP: async (email) => {
    return apiRequest('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Login user
  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Get user profile
  getProfile: async () => {
    return apiRequest('/auth/profile', {
      method: 'GET',
    });
  },
  // Health check
  healthCheck: async () => {
    return apiRequest('/auth/health', {
      method: 'GET',
    });
  },
  // Brand registration
  brandRegister: async (brandData) => {
    return apiRequest('/brand-auth/register', {
      method: 'POST',
      body: JSON.stringify(brandData),
    });
  },

  // Brand OTP verification
  brandVerifyOTP: async (email, otpCode) => {
    return apiRequest('/brand-auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otpCode }),
    });
  },

  // Brand resend OTP
  brandResendOTP: async (email) => {
    return apiRequest('/brand-auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Brand login
  brandLogin: async (email, password) => {
    return apiRequest('/brand-auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Forgot password - send reset code
  forgotPassword: async (email) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Verify forgot password OTP
  verifyForgotPasswordOTP: async (email, otpCode) => {
    return apiRequest('/auth/verify-forgot-password-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otpCode }),
    });
  },

  // Reset password
  resetPassword: async (email, resetToken, newPassword) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, resetToken, newPassword }),
    });
  },
};

/**
 * Admin API functions
 */
export const adminAPI = {
  // Admin login with secret key (no auth token needed)
  login: async (secretKey) => {
    return apiRequest('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ secretKey }),
    });
  },

  // Get pending brands
  getPendingBrands: async () => {
    return adminApiRequest('/admin/brands/pending', {
      method: 'GET',
    });
  },

  // Approve brand
  approveBrand: async (brandId, adminNote = '') => {
    return adminApiRequest(`/admin/brands/${brandId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ reason: adminNote }),
    });
  },

  // Reject brand
  rejectBrand: async (brandId, reason = '', adminNote = '') => {
    return adminApiRequest(`/admin/brands/${brandId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason: reason || adminNote }),
    });
  },

  // Get all brands (pending, approved, rejected)
  getAllBrands: async () => {
    return adminApiRequest('/admin/brands/all', {
      method: 'GET',
    });
  },

  // Get dashboard stats (alternative name for consistency)
  getDashboardStats: async () => {
    return adminApiRequest('/admin/dashboard/stats', {
      method: 'GET',
    });
  },
};

/**
 * Utility functions for token management (Legacy - use auth.js utilities instead)
 */
export const tokenUtils = {
  setToken: (token) => {
    localStorage.setItem('userToken', token);
  },

  getToken: () => {
    return localStorage.getItem('userToken');
  },

  removeToken: () => {
    localStorage.removeItem('userToken');
  },

  isTokenExpired: (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  },
};

export default apiRequest;
