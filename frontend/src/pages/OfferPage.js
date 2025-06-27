import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/OfferPage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getOfferById, getOffersByCategory } from '../services/offerData';

function OfferPage() {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const [offerData, setOfferData] = useState(null);
  const [categoryOffers, setCategoryOffers] = useState([]);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(null);
  const [showCodeScreen, setShowCodeScreen] = useState(false);
  
  useEffect(() => {
    try {
      const data = getOfferById(offerId);
      console.log('Current offer data:', data);
      setOfferData(data);
      
      // Get all offers in the same category
      const categoryData = getOffersByCategory(data.category);
      console.log(`Offers in ${data.category} category:`, categoryData);
      setCategoryOffers(categoryData);
      
      // Find the index of the current offer in the category list
      const currentIndex = categoryData.findIndex(offer => offer.id === offerId);
      console.log('Current offer index in category:', currentIndex);
      setCurrentOfferIndex(currentIndex >= 0 ? currentIndex : 0);
      
    } catch (err) {
      console.error('Error fetching offer:', err);
      setError("Error fetching offer details. Please try again later.");
    }
  }, [offerId]);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrevOffer();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNextOffer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleRating = (value) => {
    setRating(value);
  };

  const handleRedeemNow = () => {
    navigate(`/redeem-code/${offerId}`);
  };

  const handleShowCode = () => {
    navigate(`/redeem-code/${offerId}`);
  };

  const handlePrevOffer = () => {
    if (categoryOffers.length > 0) {
      const newIndex = currentOfferIndex > 0 ? currentOfferIndex - 1 : categoryOffers.length - 1;
      setCurrentOfferIndex(newIndex);
      const newOfferId = categoryOffers[newIndex].id;
      navigate(`/offer/${newOfferId}`);
    }
  };

  const handleNextOffer = () => {
    if (categoryOffers.length > 0) {
      const newIndex = currentOfferIndex < categoryOffers.length - 1 ? currentOfferIndex + 1 : 0;
      setCurrentOfferIndex(newIndex);
      const newOfferId = categoryOffers[newIndex].id;
      navigate(`/offer/${newOfferId}`);
    }
  };

  const handleIndicatorClick = (index) => {
    if (categoryOffers.length > 0 && index >= 0 && index < categoryOffers.length) {
      setCurrentOfferIndex(index);
      const newOfferId = categoryOffers[index].id;
      navigate(`/offer/${newOfferId}`);
    }
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

  if (!offerData || categoryOffers.length === 0) {
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
      <div className="offer-page-container">
        {!showCodeScreen ? (
          // First Screen: Carousel-style offer display
          <>
            <div className="category-header">
              <h1>{offerData.category || 'Fashion'}</h1>
              {categoryOffers.length > 1 && (
                <p className="offer-counter">
                  {currentOfferIndex + 1} of {categoryOffers.length} offers
                </p>
              )}
            </div>
            <div className="offer-carousel-container">
              <button 
                className="carousel-nav-btn prev-btn" 
                onClick={handlePrevOffer}
                disabled={categoryOffers.length <= 1}
              >
                <span>&lt;</span>
              </button>
              <div className="offer-carousel-card">
                <div className="offer-content-wrapper">
                  <div className="offer-brand-section">
                    <div className="offer-brand-logo-small">
                      <img src={offerData.logo || "/images/logos/placeholder.png"} alt={offerData.brand} />
                    </div>
                    <h2 className="brand-name-large">{offerData.brand}</h2>
                  </div>
                  <div className="offer-text-content">
                    <h3 className="offer-main-title">{offerData.title}</h3>
                    <p className="offer-description-text">{offerData.discount}</p>
                  </div>
                  <div className="offer-cta-section">
                    <button className="redeem-now-btn" onClick={handleRedeemNow}>
                      Redeem now
                    </button>
                  </div>
                </div>
                <div className="offer-image-section">
                  <img src={offerData.image || "/images/placeholder.jpg"} alt={offerData.title} />
                </div>
              </div>
              <button 
                className="carousel-nav-btn next-btn" 
                onClick={handleNextOffer}
                disabled={categoryOffers.length <= 1}
              >
                <span>&gt;</span>
              </button>
            </div>
          </>
        ) : (
          // Second Screen: Rating and "Show code" - simplified layout
          <div className="redeem-screen">
            <div className="redeem-content">
              <div className="offer-brand-logo-center">
                <img src={offerData.logo || "/images/logos/placeholder.png"} alt={offerData.brand} />
              </div>
              <h1 className="discount-title">{offerData.discount}</h1>
              <div className="offer-rating">
                <p>Rate this offer:</p>
                <div className="rating-buttons">
                  <button 
                    className={`thumbs-up ${rating === true ? 'active' : ''}`} 
                    onClick={() => handleRating(true)}
                  >
                    👍
                  </button>
                  <button 
                    className={`thumbs-down ${rating === false ? 'active' : ''}`} 
                    onClick={() => handleRating(false)}
                  >
                    👎
                  </button>
                </div>
              </div>
              <div className="offer-action">
                <p>Enter this code at checkout to get {offerData.discount}.</p>
                <p className="visit-website">Get your code now and visit the {offerData.brand} website.</p>
                <button className="show-code-btn" onClick={handleShowCode}>
                  Show code
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default OfferPage;
