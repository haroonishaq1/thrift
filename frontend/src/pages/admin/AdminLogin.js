import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import '../../styles/AdminLogin.css';

const AdminLogin = () => {
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!secretKey.trim()) {
        setError('Secret key is required');
        setLoading(false);
        return;
      }

      console.log('🔐 Attempting admin login...');
      const response = await adminAPI.login(secretKey);

      if (response.success) {
        console.log('✅ Admin login successful');
        // Store admin token
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminData', JSON.stringify(response.data.admin));
        
        // Redirect to admin dashboard
        navigate('/admin/dashboard');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Admin login error:', error);
      setError(error.response?.data?.message || 'Login failed. Please check your secret key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <div className="admin-login-header">
          <h1>🔒 Admin Login</h1>
          <p>Enter your secret key to access the admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="secretKey">Secret Key</label>
            <input
              type="password"
              id="secretKey"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Enter admin secret key"
              className={error ? 'error' : ''}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <button 
            type="submit" 
            className="admin-login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              'Login as Admin'
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <p>🔐 Only authorized personnel can access this area</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
