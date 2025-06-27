import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/RedeemedCodePage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getOfferById } from '../services/offerData';

function RedeemedCodePage() {
  const { offerId } = useParams();
  const [offer, setOffer] = useState(null);
  const [showCode, setShowCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(null);
  const [copied, setCopied] = useState(false);
  const [userRating, setUserRating] = useState(null);

  // Function to extract just the discount amount (e.g., "£150 off" from "£150 off + Free Galaxy Buds")
  const getDiscountAmount = (discountText) => {
    if (!discountText) return discountText;
    
    // Try to extract percentage discount (e.g., "15%" from "15% off")
    const percentMatch = discountText.match(/(\d+%)/);
    if (percentMatch) return percentMatch[1] + " discount";
    
    // Try to extract monetary discount (e.g., "£150 off" from "£150 off + Free Galaxy Buds")
    const moneyMatch = discountText.match(/(£\d+\s*off|€\d+\s*off|\$\d+\s*off)/i);
    if (moneyMatch) return moneyMatch[1];
    
    // If no specific pattern found, return first part before "+" or ","
    const firstPart = discountText.split(/[+,]/)[0].trim();
    return firstPart || discountText;
  };

  useEffect(() => {
    const fetchOffer = () => {
      try {
        const offerData = getOfferById(offerId);
        setOffer(offerData);
        
        // Generate a code with format: THRIFT-BRANDID-OFFER-ID-random6digits
        const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
        const code = `THRIFT-${offerData.id}-${offerId}-${randomSixDigits}`;
        setGeneratedCode(code);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching offer:', error);
        setLoading(false);
      }
    };

    fetchOffer();
  }, [offerId]);

  const handleShowCode = () => {
    setShowCode(true);
  };

  const handleRating = (type) => {
    setUserRating(type);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWebsite = () => {
    if (offer?.redemptionUrl) {
      window.open(offer.redemptionUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="redeemed-page">
        <Header />
        <div className="loading-container">
          <div className="loading">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="redeemed-page">
        <Header />
        <div className="error-container">
          <div className="error">Offer not found</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="redeemed-page">
      <Header />
      
      <div className="redeemed-main">
        {/* Brand Logo - Above and outside the card */}
        <div className="brand-logo-container">
          <img src={offer.logo || "/images/logos/placeholder.png"} alt={offer.brand} className="brand-logo" />
        </div>
        
        <div className="redeemed-container">
          <div className="redeemed-card">
            {/* Large Discount Text */}
            <h1 className="discount-title">{getDiscountAmount(offer.discount)}</h1>
            
            {/* Rating Section */}
            <div className="rating-section">
              <p className="rate-text">Rate this offer:</p>
              <div className="rating-buttons">
                <button 
                  className={`rating-btn thumbs-up ${userRating === 'up' ? 'active' : ''}`}
                  onClick={() => handleRating('up')}
                >
                  👍
                </button>
                <button 
                  className={`rating-btn thumbs-down ${userRating === 'down' ? 'active' : ''}`}
                  onClick={() => handleRating('down')}
                >
                  👎
                </button>
              </div>
            </div>
            
            {/* Code Display - Below rating buttons */}
            {showCode && (
              <div className="code-container">
                <input 
                  type="text" 
                  value={generatedCode} 
                  readOnly 
                  className="code-field"
                />
                <button 
                  className={`copy-btn ${copied ? 'copied' : ''}`}
                  onClick={handleCopy}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
            
            {/* Instruction Text */}
            <p className="instruction-text">
              Enter this code at checkout to get {getDiscountAmount(offer.discount)}.
            </p>
            
            {/* Additional Text */}
            <p className="additional-text">
              Get your code now and visit the {offer.brand} website.
            </p>
            
            {/* Show Code Button */}
            {!showCode && (
              <button className="show-code-btn" onClick={handleShowCode}>
                Show code
              </button>
            )}
            
            {/* Open Website Button - Always shown */}
            {showCode && (
              <button className="open-website-btn" onClick={handleOpenWebsite}>
                Open website
              </button>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default RedeemedCodePage;
