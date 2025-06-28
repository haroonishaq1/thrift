import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProductCard.css';

function ProductCard({ id, brand, discount, logo, imageSrc, title, description, logoAlt }) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to the offer page with the offer ID
    navigate(`/offer/${id || brand?.toLowerCase().replace(/\s+/g, '-') || title?.toLowerCase().replace(/\s+/g, '-')}`);
  };

  return (
    <div className="product-card" onClick={handleClick}>
      <div className="card-image-container">
        <img src={imageSrc} alt={title || brand} className="main-image" />
        <div className="brand-logo-overlay">
          <img 
            src={logo} 
            alt={logoAlt || brand} 
            className="brand-logo-img"
            style={{ display: logo && logo.trim() ? 'block' : 'none' }}
            onError={(e) => {
              // If logo fails to load, hide the img and show the brand initial
              console.log('Logo failed to load:', logo);
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
            onLoad={(e) => {
              console.log('Logo loaded successfully:', logo);
            }}
          />
          <div className="brand-initial" style={{ display: (logo && logo.trim()) ? 'none' : 'flex' }}>
            {(brand || title || '?').charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
      <div className="card-info">
        <div className="discount-badge">
          {description || discount}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
