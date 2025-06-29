import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { offersAPI } from '../services/api';
import '../styles/Offers.css';

const Offers = ({ isLoggedIn }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all offers from the API
        const response = await offersAPI.getAllOffers();
        
        if (response && response.offers) {
          setOffers(response.offers);
        } else {
          setOffers([]);
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
        setError('Failed to load offers. Please try again later.');
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const handleOfferClick = (offerId) => {
    navigate(`/offer/${offerId}`);
  };

  if (loading) {
    return (
      <div className="offers-page">
        <Header isLoggedIn={isLoggedIn} />
        <div className="loading-spinner">
          <p>Loading offers...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="offers-page">
        <Header isLoggedIn={isLoggedIn} />
        <div className="error-message">
          <p>{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="offers-page">
      <Header isLoggedIn={isLoggedIn} />
      
      <main className="offers-main">
        <div className="container">
          <div className="offers-header">
            <h1>All Offers</h1>
            <p>Discover amazing deals and discounts from your favorite brands</p>
          </div>

          {offers.length > 0 ? (
            <div className="offers-grid">
              {offers.map((offer) => (
                <ProductCard
                  key={offer.id}
                  offer={offer}
                  onClick={() => handleOfferClick(offer.id)}
                />
              ))}
            </div>
          ) : (
            <div className="no-offers">
              <p>No offers available at the moment. Please check back later!</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Offers;
