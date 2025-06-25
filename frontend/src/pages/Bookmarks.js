import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { isUserAuthenticated } from '../utils/auth';
import '../styles/Profile.css';

function Bookmarks({ isLoggedIn }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    if (!isUserAuthenticated()) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  return (
    <div className="profile-container">
      <Header isLoggedIn={isLoggedIn} />
      
      <div className="profile-content">
        <div className="profile-header">
          <h1>My Bookmarks</h1>
          <p>Your saved offers and brands</p>
        </div>

        <div className="bookmarks-content">
          <div className="empty-state">
            <h3>No bookmarks yet</h3>
            <p>Start exploring offers and bookmark your favorites!</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Bookmarks;