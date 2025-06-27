import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearUserAuth } from '../utils/auth';
import '../styles/Header.css';

function Header({ isLoggedIn }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const toggleHamburgerMenu = () => {
    setShowHamburgerMenu(!showHamburgerMenu);
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
            <div className="hamburger-menu-container">
              <button className="hamburger-button" onClick={toggleHamburgerMenu}>
                <span>☰</span>
              </button>
              {showHamburgerMenu && (
                <>
                  <div className="menu-overlay" onClick={toggleHamburgerMenu}></div>
                  <div className={`side-menu ${showHamburgerMenu ? 'open' : ''}`}>
                    <div className="menu-header">
                      <button className="close-button" onClick={toggleHamburgerMenu}>
                        ✕
                      </button>
                    </div>
                    <div className="menu-content">
                      <div className="menu-item">
                        <Link to="/login" onClick={() => setShowHamburgerMenu(false)}>
                          <div className="menu-item-content">
                            <span className="menu-title">Login</span>
                            <span className="menu-subtitle">Access your student account</span>
                          </div>
                          <span className="arrow">›</span>
                        </Link>
                      </div>
                      <div className="menu-item">
                        <Link to="/signup" onClick={() => setShowHamburgerMenu(false)}>
                          <div className="menu-item-content">
                            <span className="menu-title">Sign Up</span>
                            <span className="menu-subtitle">Create a new student account</span>
                          </div>
                          <span className="arrow">›</span>
                        </Link>
                      </div>
                      <div className="menu-item">
                        <Link to="/brand/register/step1" onClick={() => setShowHamburgerMenu(false)}>
                          <div className="menu-item-content">
                            <span className="menu-title">Brand Register</span>
                            <span className="menu-subtitle">Register your business</span>
                          </div>
                          <span className="arrow">›</span>
                        </Link>
                      </div>
                      <div className="menu-item">
                        <Link to="/brand/login" onClick={() => setShowHamburgerMenu(false)}>
                          <div className="menu-item-content">
                            <span className="menu-title">Brand Login</span>
                            <span className="menu-subtitle">Access your brand dashboard</span>
                          </div>
                          <span className="arrow">›</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
