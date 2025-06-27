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
      {imageSrc && (
        <div className="card-image">
          <img src={imageSrc} alt={title || brand} />
        </div>
      )}
      <div className="card-content">
        <h3 className="brand-name">{title || brand}</h3>
        <p className="discount">{description || discount}</p>
      </div>
    </div>
  );
}

export default ProductCard;
