import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import '../styles/CategoryPage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NavCategories from '../components/NavCategories';
import { offersAPI } from '../services/api';

function CategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        let categoryOffers;
        if (category === 'hot-deals') {
          // Fetch featured offers for hot deals
          const response = await offersAPI.getFeaturedOffers();
          categoryOffers = response.data || [];
        } else {
          // Fetch offers by category
          const response = await offersAPI.getOffersByCategory(category);
          categoryOffers = response.data || [];
        }
        
        setOffers(categoryOffers);
      } catch (error) {
        console.error('Error fetching offers:', error);
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [category]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % offers.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + offers.length) % offers.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleRedeemClick = (offerId) => {
    navigate(`/offer/${offerId}`);
  };

  if (loading && offers.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="category-page">
      <Header />
      <NavCategories />
      <main className="category-content">
        <h1 className="category-title">
          {category === 'hot-deals' ? 'Hot Deals' : category.charAt(0).toUpperCase() + category.slice(1)}
        </h1>
        
        {/* Category Carousel */}
        <section className="category-carousel">
          {offers.length > 0 && (
            <>
              <button 
                className="carousel-btn prev" 
                onClick={prevSlide}
                aria-label="Previous slide"
              >
                <FaChevronLeft />
              </button>
              
              <div className="carousel-viewport">
                <div 
                  className="carousel-track"
                  style={{
                    transform: `translateX(-${currentSlide * 100}%)`
                  }}
                >
                  {offers.map((offer, index) => (
                    <div 
                      key={offer.id} 
                      className="carousel-slide"
                    >
                      <div className="slide-content">
                        <div className="brand-logo">
                          <img 
                            src={`/images/logos/${offer.brand_name?.toLowerCase()}.png`} 
                            alt={offer.brand_name} 
                            onError={(e) => {
                              e.target.src = '/images/logos/default.png';
                            }}
                          />
                        </div>
                        <div className="slide-info">
                          <h2 className="discount-text">{offer.discount_percent}% OFF</h2>
                          <p className="description">{offer.description}</p>
                        </div>
                        <div className="slide-image">
                          <img 
                            src={offer.image_url ? `http://localhost:5000${offer.image_url}` : '/images/placeholder.jpg'} 
                            alt={offer.title} 
                          />
                        </div>
                        <button 
                          className="redeem-btn"
                          onClick={() => handleRedeemClick(offer.id)}
                        >
                          Redeem now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <button 
                className="carousel-btn next" 
                onClick={nextSlide}
                aria-label="Next slide"
              >
                <FaChevronRight />
              </button>

              <div className="carousel-dots">
                {offers.map((_, index) => (
                  <button
                    key={index}
                    className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {loading && (
          <div className="loading-indicator">
            Loading more deals...
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default CategoryPage;
