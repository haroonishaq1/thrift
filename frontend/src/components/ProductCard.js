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
      <div className="card-image">
        <img src={imageSrc} alt={title || brand} />
        <div className="brand-logo">
          {logo ? (
            <img 
              src={logo} 
              alt={logoAlt || brand} 
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="brand-initial" style={{ display: logo ? 'none' : 'flex' }}>
            {(brand || title || '?').charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
      <div className="card-content">
        <p className="discount-text">{description || discount}</p>
      </div>
    </div>
  );
}

export default ProductCard;
