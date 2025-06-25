import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import '../../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingBrands, setPendingBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }

    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard stats and pending brands
      const [statsResponse, pendingResponse] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getPendingBrands()
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (pendingResponse.success) {
        setPendingBrands(pendingResponse.data.pendingBrands || []);
      }

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBrand = async (brandId, brandName) => {
    try {
      const response = await adminAPI.approveBrand(brandId, 'Approved by admin');
      
      if (response.success) {
        alert(`✅ Brand "${brandName}" approved successfully!`);
        loadDashboardData(); // Reload data
      } else {
        alert(`❌ Failed to approve brand: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Error approving brand:', error);
      alert('❌ Failed to approve brand');
    }
  };

  const handleRejectBrand = async (brandId, brandName) => {
    const reason = prompt('Enter rejection reason (optional):');
    
    try {
      const response = await adminAPI.rejectBrand(brandId, reason || 'Rejected by admin');
      
      if (response.success) {
        alert(`❌ Brand "${brandName}" rejected successfully!`);
        loadDashboardData(); // Reload data
      } else {
        alert(`❌ Failed to reject brand: ${response.message}`);
      }
    } catch (error) {
      console.error('❌ Error rejecting brand:', error);
      alert('❌ Failed to reject brand');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-logo">
          <h1>🎯 Admin Dashboard</h1>
        </div>
        <div className="dashboard-actions">
          <button onClick={handleLogout} className="logout-button">
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        <div className="welcome-section">
          <h1>Welcome to Admin Dashboard</h1>
          <p>Manage brand approvals and monitor system statistics from here.</p>
        </div>

        {/* Dashboard Stats */}
        {stats && (
          <div className="dashboard-cards">
            <div className="dashboard-card">
              <h3>📊 Total Brands</h3>
              <p>Total number of registered brands in the system</p>
              <div className="stat-number">{stats.totalBrands}</div>
            </div>
            
            <div className="dashboard-card">
              <h3>⏳ Pending Approval</h3>
              <p>Brands waiting for admin approval</p>
              <div className="stat-number pending">{stats.pendingBrands}</div>
            </div>
            
            <div className="dashboard-card">
              <h3>✅ Approved</h3>
              <p>Successfully approved and active brands</p>
              <div className="stat-number approved">{stats.approvedBrands}</div>
            </div>
            
            <div className="dashboard-card">
              <h3>❌ Rejected</h3>
              <p>Brands that were rejected during review</p>
              <div className="stat-number rejected">{stats.rejectedBrands}</div>
            </div>
          </div>
        )}

        {/* Pending Brands Section */}
        <div className="pending-brands-section">
          <h2>⏳ Pending Brand Approvals ({pendingBrands.length})</h2>
          
          {pendingBrands.length === 0 ? (
            <div className="dashboard-card">
              <h3>🎉 All Caught Up!</h3>
              <p>No pending brand approvals at this time.</p>
            </div>
          ) : (
            <div className="dashboard-cards">
              {pendingBrands.map((brand) => (
                <div key={brand.id} className="dashboard-card">
                  <h3>{brand.name}</h3>
                  <div className="brand-details">
                    <p><strong>Email:</strong> {brand.email}</p>
                    <p><strong>Website:</strong> {brand.website}</p>
                    <p><strong>Admin:</strong> {brand.adminUsername}</p>
                    <p><strong>Submitted:</strong> {new Date(brand.submittedAt).toLocaleDateString()}</p>
                    {brand.description && (
                      <p><strong>Description:</strong> {brand.description}</p>
                    )}
                  </div>
                  
                  <div className="brand-actions">
                    <button 
                      onClick={() => handleApproveBrand(brand.id, brand.name)}
                      className="approve-btn"
                    >
                      ✅ Approve
                    </button>
                    <button 
                      onClick={() => handleRejectBrand(brand.id, brand.name)}
                      className="reject-btn"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
