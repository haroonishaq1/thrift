import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/RedeemedCodePage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getOfferById } from '../services/offerData';

function RedeemedCodePage() {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const [offerData, setOfferData] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    // Simulate API fetch with timeout
    setTimeout(() => {
      try {
        const data = getOfferById(offerId);
        setOfferData(data);
      } catch (err) {
        setError("Error fetching offer details. Please try again later.");
      }
    }, 500);
  }, [offerId]);

  const handleCopyCode = () => {
    if (offerData && offerData.code) {
      navigator.clipboard.writeText(offerData.code)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  };

  const handleOpenWebsite = () => {
    if (offerData && offerData.websiteUrl) {
      window.open(offerData.websiteUrl, '_blank');
    }
  };

  if (error) {
    return (
      <div className="redeemed-code-page">
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
      <div className="redeemed-code-page">
        <Header />
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your discount code...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="redeemed-code-page">
      <Header />
      
      <div className="redeemed-container">
        <h1>{offerData.title}</h1>
        
        <div className="rate-offer">
          <p>Rate this offer:</p>
          <div className="rating-buttons">
            <button className="thumbs-down">👎</button>
            <button className="thumbs-up">👍</button>
          </div>
        </div>
        
        <p className="instruction-text">{offerData.description}</p>
        
        <div className="code-display">
          <div className="code-text">{offerData.code}</div>
          <button 
            className={`copy-btn ${copied ? 'copied' : ''}`} 
            onClick={handleCopyCode}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        
        <div className="terms-note">
          <p>{offerData.termsAndConditions}</p>
        </div>
        
        <button className="open-website-btn" onClick={handleOpenWebsite}>
          Open website
        </button>
      </div>
      
      <Footer />
    </div>
  );
}

export default RedeemedCodePage;
