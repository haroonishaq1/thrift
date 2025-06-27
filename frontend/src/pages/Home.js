import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import Header from '../components/Header';
import NavCategories from '../components/NavCategories';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { FaChevronLeft, FaChevronRight, FaFire, FaLaptop } from 'react-icons/fa';
import { offersAPI } from '../services/api';

function Home({ isLoggedIn }) {
  const [currentSlide, setCurrentSlide] = useState(5); // Start at index 5 (middle of extended array)
  const [itemsPerView, setItemsPerView] = useState(3);
  const [electronicsOffers, setElectronicsOffers] = useState([]);
  const [fashionOffers, setFashionOffers] = useState([]);
  const [featuredOffers, setFeaturedOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch electronics offers
        const electronicsResponse = await offersAPI.getOffersByCategory('electronics');
        setElectronicsOffers(electronicsResponse.data?.slice(0, 4) || []);
        
        // Fetch fashion offers
        const fashionResponse = await offersAPI.getOffersByCategory('fashion');
        setFashionOffers(fashionResponse.data?.slice(0, 4) || []);
        
        // Fetch featured offers (hot deals)
        const featuredResponse = await offersAPI.getFeaturedOffers(4);
        setFeaturedOffers(featuredResponse.data || []);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set empty arrays as fallback
        setElectronicsOffers([]);
        setFashionOffers([]);
        setFeaturedOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const next = prev + 1;
      // Reset to middle set if we reach the end of extended items
      if (next >= 15 - 5) { // 15 total items, reset before last 5
        setTimeout(() => setCurrentSlide(5), 500);
        return next;
      }
      return next;
    });
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      const next = prev - 1;
      // Reset to middle set if we reach the beginning
      if (next < 0) {
        setTimeout(() => setCurrentSlide(9), 500); // 15 - 5 - 1
        return next;
      }
      return next;
    });
  };

  // Handle responsive items per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setItemsPerView(1);
      } else if (window.innerWidth <= 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate transform distance based on screen size (per card)
  const getTransformDistance = () => {
    if (window.innerWidth <= 768) {
      // Mobile: 1 card per view
      return window.innerWidth - 60;
    } else if (window.innerWidth <= 1024) {
      // Tablet: 2 cards per view  
      return (window.innerWidth - 80) / 2;
    } else {
      // Desktop: 285px card + 20px gap = 305px per card
      return 305;
    }
  };

  // Handle hot deals card click
  const handleHotDealClick = (dealId) => {
    navigate(`/offer/${dealId}`);
  };

  const carouselItems = [
    {
      id: 1,
      imageSrc: '/images/carousel/samsung-s25.jpg',
      title: "The new Galaxy S25 Edge",
      description: '📱 ✨ Pre-order now and secure benefits.*',
      brandName: "SAMSUNG",
      logo: '/images/logos/samsung.png',
    },
    {
      id: 2,
      imageSrc: '/images/carousel/apple-promo.jpg',
      title: '15% off all Apple products every month',
      description: 'Achtung, neue Preise auf Apple-Geräte! 🍎',
      brandName: 'GROVER',
      logo: '/images/logos/grover.png',
    },
    {
      id: 4,
      imageSrc: '/images/carousel/sky-streaming.jpg',
      title: 'Discover Sky Stream now!',
      description: 'Entertainment and sports streaming 🏆',
      brandName: 'SKY',
      logo: '/images/logos/sky.png',
    },
    {
      id: 5,
      imageSrc: '/images/levis.svg',
      title: "Levi's Exclusive",
      description: '20% student discount on all items',
      brandName: "LEVI'S",
      logo: '/images/logos/levis.png',
    },
    {
      id: 6,
      imageSrc: '/images/swarovski.svg',
      title: 'Swarovski Collection',
      description: 'Up to 30% off on selected items',
      brandName: 'SWAROVSKI',
      logo: '/images/logos/swarovski.png',
    }
  ];

  // Create seamless carousel by duplicating items
  const extendedCarouselItems = [...carouselItems, ...carouselItems, ...carouselItems];

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="home">
      <Header isLoggedIn={isLoggedIn} />
      <NavCategories />
      
      {/* Hero Carousel Section */}
      <section className="hero-carousel">
        <div className="carousel-wrapper">
          <div className="carousel-viewport">
            <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * getTransformDistance()}px)` }}>
            {extendedCarouselItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className="carousel-card">
                <div className="card-image">
                  <img src={item.imageSrc} alt={item.title} />
                </div>
                <div className="card-overlay">
                  <div className="card-content">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
          <button className="nav-btn prev" onClick={prevSlide}>
            <FaChevronLeft />
          </button>
          <button className="nav-btn next" onClick={nextSlide}>
            <FaChevronRight />
          </button>
          <div className="carousel-indicators">
            {carouselItems.map((_, index) => (
              <button
                key={index}
                className={`indicator ${(currentSlide % 5) === index ? 'active' : ''}`}
                onClick={() => setCurrentSlide(5 + index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Hot Deals Section */}
      <section className="hot-deals">
        <div className="container">
          <div className="section-header">
            <div className="header-content">
              <FaFire className="fire-icon" />
              <h2>Hot Deals</h2>
              <p>Don't miss out on these amazing student discounts!</p>
            </div>
            <button className="show-more">
              Show more <span>→</span>
            </button>
          </div>
          {loading ? (
            <div className="loading-spinner">Loading deals...</div>
          ) : (
            <div className="deals-grid">
              {featuredOffers.map((offer, index) => (
                <div key={offer.id || index} onClick={() => handleHotDealClick(offer.id)} style={{ cursor: 'pointer' }}>
                  <ProductCard
                    imageSrc={offer.image_url ? `http://localhost:5000${offer.image_url}` : '/images/placeholder.jpg'}
                    logo={offer.brand_logo_url ? `http://localhost:5000${offer.brand_logo_url}` : null}
                    title={offer.title}
                    description={`${offer.discount_percent}% off`}
                    logoAlt={offer.brand_name}
                    brandName={offer.brand_name}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="shop-by-category">
        <div className="container">
          <div className="main-section-header">
            <h2>Shop by Category</h2>
          </div>
          
          <div className="category-section">
            <div className="category-header">
              <div className="category-title-section">
                <h3>Electronics & Technology</h3>
                <button className="show-more" onClick={() => navigate('/category/electronics')}>
                  Show more <span>→</span>
                </button>
              </div>
              <p className="category-description">Need a new smartphone, MacBook, or laptop? From Apple to MediaMarkt: We have the best tech deals for students.</p>
            </div>
            
            {loading ? (
              <div className="loading-spinner">Loading electronics offers...</div>
            ) : (
              <div className="category-offers-grid">
                {electronicsOffers.length > 0 ? (
                  electronicsOffers.map((offer, index) => (
                    <div key={offer.id || index} onClick={() => navigate(`/offer/${offer.id}`)} style={{ cursor: 'pointer' }}>
                      <ProductCard
                        imageSrc={offer.image_url ? `http://localhost:5000${offer.image_url}` : '/images/placeholder.jpg'}
                        logo={offer.brand_logo_url ? `http://localhost:5000${offer.brand_logo_url}` : null}
                        title={offer.title}
                        description={`${offer.discount_percent}% off`}
                        logoAlt={offer.brand_name}
                        brandName={offer.brand_name}
                      />
                    </div>
                  ))
                ) : (
                  <div className="no-offers">
                    <p>No electronics offers available at the moment. Check back soon!</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="category-section">
            <div className="category-header">
              <div className="category-title-section">
                <h3>Fashion</h3>
                <button className="show-more" onClick={() => navigate('/category/fashion')}>
                  Show more <span>→</span>
                </button>
              </div>
              <p className="category-description">Stay stylish with the best fashion deals for students. From trendy clothing to accessories, find your perfect look for less.</p>
            </div>
            
            {loading ? (
              <div className="loading-spinner">Loading fashion offers...</div>
            ) : (
              <div className="category-offers-grid">
                {fashionOffers.length > 0 ? (
                  fashionOffers.map((offer, index) => (
                    <div key={offer.id || index} onClick={() => navigate(`/offer/${offer.id}`)} style={{ cursor: 'pointer' }}>
                      <ProductCard
                        imageSrc={offer.image_url ? `http://localhost:5000${offer.image_url}` : '/images/placeholder.jpg'}
                        logo={offer.brand_logo_url ? `http://localhost:5000${offer.brand_logo_url}` : null}
                        title={offer.title}
                        description={`${offer.discount_percent}% off`}
                        logoAlt={offer.brand_name}
                        brandName={offer.brand_name}
                      />
                    </div>
                  ))
                ) : (
                  <div className="no-offers">
                    <p>No fashion offers available at the moment. Check back soon!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
