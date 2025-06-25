// Authentication utilities for Project Thrift

// Brand Authentication Functions
export const isBrandAuthenticated = () => {
  const token = localStorage.getItem('brandToken');
  const brandData = localStorage.getItem('brandData');
  
  if (!token || !brandData) {
    return false;
  }
  
  try {
    const parsedData = JSON.parse(brandData);
    // Check if token is expired (if expiry is set)
    if (parsedData.expires && new Date() > new Date(parsedData.expires)) {
      clearBrandAuth();
      return false;
    }
    return true;
  } catch (error) {
    clearBrandAuth();
    return false;
  }
};

export const storeBrandAuth = (token, brandData) => {
  localStorage.setItem('brandToken', token);
  localStorage.setItem('brandData', JSON.stringify(brandData));
  
  // Set expiry for 24 hours from now
  const expiryTime = new Date();
  expiryTime.setHours(expiryTime.getHours() + 24);
  
  const dataWithExpiry = {
    ...brandData,
    expires: expiryTime.toISOString()
  };
  
  localStorage.setItem('brandData', JSON.stringify(dataWithExpiry));
};

export const getBrandData = () => {
  const brandData = localStorage.getItem('brandData');
  if (!brandData) return null;
  
  try {
    return JSON.parse(brandData);
  } catch (error) {
    clearBrandAuth();
    return null;
  }
};

export const getBrandToken = () => {
  return localStorage.getItem('brandToken');
};

export const clearBrandAuth = () => {
  localStorage.removeItem('brandToken');
  localStorage.removeItem('brandData');
};

// User Authentication Functions (for regular users)
export const isUserAuthenticated = () => {
  const token = localStorage.getItem('userToken');
  const userData = localStorage.getItem('userData');
  
  if (!token || !userData) {
    return false;
  }
  
  try {
    const parsedData = JSON.parse(userData);
    // Check if token is expired
    if (parsedData.expires && new Date() > new Date(parsedData.expires)) {
      clearUserAuth();
      return false;
    }
    return true;
  } catch (error) {
    clearUserAuth();
    return false;
  }
};

export const storeUserAuth = (token, userData) => {
  localStorage.setItem('userToken', token);
  
  // Set expiry for 7 days from now for regular users
  const expiryTime = new Date();
  expiryTime.setDate(expiryTime.getDate() + 7);
  
  const dataWithExpiry = {
    ...userData,
    expires: expiryTime.toISOString()
  };
  
  localStorage.setItem('userData', JSON.stringify(dataWithExpiry));
};

export const getUserData = () => {
  const userData = localStorage.getItem('userData');
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    clearUserAuth();
    return null;
  }
};

export const getUserToken = () => {
  return localStorage.getItem('userToken');
};

export const clearUserAuth = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userData');
};

// Helper function to get auth headers for API calls
export const getAuthHeaders = (userType = 'user') => {
  const token = userType === 'brand' ? getBrandToken() : getUserToken();
  
  if (!token) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Specific function for brand auth headers (for backwards compatibility)
export const getBrandAuthHeaders = () => {
  const token = getBrandToken();
  
  if (!token) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Function to check if current session is valid and redirect if not
export const requireAuth = (userType = 'user') => {
  const isAuthenticated = userType === 'brand' ? isBrandAuthenticated() : isUserAuthenticated();
  
  if (!isAuthenticated) {
    // Clear any invalid auth data
    if (userType === 'brand') {
      clearBrandAuth();
    } else {
      clearUserAuth();
    }
    return false;
  }
  
  return true;
};
