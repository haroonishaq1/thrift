import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/OfferPage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getOfferById } from '../services/offerData';

function OfferPage() {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const [offerData, setOfferData] = useState(null);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(null);
  
  useEffect(() => {
    // Use timeout to simulate API fetch
    setTimeout(() => {
      try {
        const data = getOfferById(offerId);
        setOfferData(data);
      } catch (err) {
        setError("Error fetching offer details. Please try again later.");
      }
    }, 500);
  }, [offerId]);

  const handleRating = (value) => {
    setRating(value);
  };

  const handleShowCode = () => {
    navigate(`/redeem-code/${offerId}`);
  };

  if (error) {
    return (
      <div className="offer-page">
        <Header />
        <div className="error-message">
          {error}
        </div>
        <Footer />
      </div>
    );
  }

  if (!offerData) {
    return (
      <div className="offer-page">
        <Header />
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading offer details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="offer-page">
      <Header />
      
      <div className="offer-container">
        <div className="offer-header">
          <div className="offer-brand-logo">
            <img src={offerData.logo || "/images/logos/placeholder.png"} alt={offerData.brand} />
          </div>
          <h1>{offerData.brand}</h1>
        </div>
        
        <div className="offer-content">
          <div className="offer-details">
            <h2>{offerData.title}</h2>
            <p className="offer-description">{offerData.description}</p>
            
            <div className="offer-rating">
              <p>Rate this offer:</p>
              <div className="rating-buttons">
                <button 
                  className={`thumbs-down ${rating === false ? 'active' : ''}`} 
                  onClick={() => handleRating(false)}
                >
                  👎
                </button>
                <button 
                  className={`thumbs-up ${rating === true ? 'active' : ''}`} 
                  onClick={() => handleRating(true)}
                >
                  👍
                </button>
              </div>
            </div>
            
            <div className="offer-action">
              <p>Enter this code at checkout to get {offerData.title}.</p>
              <button className="show-code-btn" onClick={handleShowCode}>
                Show code
              </button>
            </div>
            
            <div className="offer-terms">
              <h3>Terms & Conditions</h3>
              <p>{offerData.termsAndConditions}</p>
              <p>Expires: {offerData.expirationDate}</p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default OfferPage;
