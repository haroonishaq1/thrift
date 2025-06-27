import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearUserAuth } from '../utils/auth';
import '../styles/Header.css';

function Header({ isLoggedIn }) {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleLogout = () => {
    clearUserAuth();
    setShowMenu(false);
    // Force a page reload to update the authentication state
    window.location.href = '/';
  };

  const UserAvatar = () => (
    <div className="user-profile">
      <button className="profile-button" onClick={toggleMenu}>
        <div className="avatar-placeholder">
          👤
        </div>
      </button>
      {showMenu && (
        <div className="profile-menu">
          <div className="profile-menu-header">
            <span>Your Thrift account</span>
          </div>
          <ul>
            <li><Link to="/my-profile">My Profile</Link></li>
            <li><button onClick={handleLogout} className="logout-button">Log Out</button></li>
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <h1>Thrift</h1>
          </Link>
        </div>
        <div className="search-section">
          <div className="search-container">
            <input type="text" placeholder="Eg. Zomondo..." className="search-input" />
            <button className="search-button">🔍</button>
          </div>
          {isLoggedIn ? (
            <UserAvatar />
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-button">Login</Link>
              <Link to="/signup" className="auth-button signup">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
