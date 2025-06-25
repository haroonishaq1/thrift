import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isBrandAuthenticated } from '../../utils/auth';
import '../../styles/brand/BrandDashboard.css';

function BrandDashboard() {
  const navigate = useNavigate();
  
  // Check authentication and redirect
  useEffect(() => {
    // First check if the user is authenticated
    if (!isBrandAuthenticated()) {
      navigate('/brand/login');
      return;
    }
    
    // If authenticated, redirect to analytics page as that will be our dashboard
    navigate('/brand/analytics');
  }, [navigate]);
  
  return (
    <div className="brand-dashboard">
      <div className="loading-redirect">Redirecting to dashboard...</div>
    </div>
  );
}

export default BrandDashboard;
