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
  const [brands, setBrands] = useState([]);
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
        
        // Fetch brands
        const brandsResponse = await offersAPI.getBrands();
        console.log('Brands response:', brandsResponse);
        setBrands(brandsResponse.data || []);
        console.log('Brands set:', brandsResponse.data || []);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set empty arrays as fallback
        setElectronicsOffers([]);
        setFashionOffers([]);
        setFeaturedOffers([]);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Set initial slide position when brands are loaded
  useEffect(() => {
    if (brands.length > 0) {
      // For single brand, start at 0. For multiple brands, start at middle set
      setCurrentSlide(brands.length === 1 ? 0 : brands.length);
    }
  }, [brands]);

  const nextSlide = () => {
    // Don't advance if there's only one brand
    if (brandCarouselItems.length <= 1) return;
    
    setCurrentSlide((prev) => {
      const next = prev + 1;
      // Reset to middle set if we reach the end of extended items
      const brandCount = brandCarouselItems.length;
      if (brandCount > 0) {
        const totalExtended = brandCount * 3;
        if (next >= totalExtended - brandCount) {
          setTimeout(() => setCurrentSlide(brandCount), 500);
          return next;
        }
      }
      return next;
    });
  };

  const prevSlide = () => {
    // Don't go back if there's only one brand
    if (brandCarouselItems.length <= 1) return;
    
    setCurrentSlide((prev) => {
      const next = prev - 1;
      // Reset to middle set if we reach the beginning
      const brandCount = brandCarouselItems.length;
      if (next < 0 && brandCount > 0) {
        setTimeout(() => setCurrentSlide(brandCount * 2 - 1), 500);
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

  // Handle brand card click - navigate to offer page with first offer from that brand
  const handleBrandClick = async (brandId, brandName) => {
    try {
      // Get offers for this brand
      const response = await offersAPI.getOffersByBrandId(brandId);
      const brandOffers = response.data || [];
      
      if (brandOffers.length > 0) {
        // Navigate to the first offer of this brand
        navigate(`/offer/${brandOffers[0].id}`);
      } else {
        // If no offers, navigate to any available offer
        const allOffers = featuredOffers.concat(electronicsOffers, fashionOffers);
        if (allOffers.length > 0) {
          navigate(`/offer/${allOffers[0].id}`);
        }
      }
    } catch (error) {
      console.error('Error fetching brand offers:', error);
      // Fallback to any available offer
      const allOffers = featuredOffers.concat(electronicsOffers, fashionOffers);
      if (allOffers.length > 0) {
        navigate(`/offer/${allOffers[0].id}`);
      }
    }
  };

  // Create dynamic carousel items from brands data
  const brandCarouselItems = brands.length > 0 ? brands.map((brand, index) => {
    const suffixes = ['Exclusive', 'Collection', 'Special', 'Premium'];
    const suffix = suffixes[index % suffixes.length];
    
    // Use carousel images as background and brand logo as overlay
    const backgroundImages = [
      '/images/carousel/apple-promo.jpg',
      '/images/carousel/samsung-s25.jpg', 
      '/images/carousel/sky-streaming.jpg',
      '/images/carousel/wow-sport.jpg',
      '/images/carousel/samsung.jpg'
    ];
    
    console.log('Brand logo URL:', brand.logo ? `http://localhost:5000${brand.logo}` : 'No logo');
    
    return {
      id: brand.id,
      imageSrc: backgroundImages[index % backgroundImages.length], // Background image
      title: `${brand.name} ${suffix}`,
      description: `Up to 30% off on selected ${brand.name} items`,
      brandName: brand.name,
      logo: brand.logo ? `http://localhost:5000${brand.logo}` : null, // Brand logo for overlay
      brandId: brand.id
    };
  }) : [
    // Fallback mock data when no brands are available
    {
      id: 1,
      imageSrc: '/images/carousel/samsung-s25.jpg',
      title: "15% off all Apple products every month",
      description: 'Achtung, neue Preise auf Apple-Geräte! 🍎',
      brandName: "APPLE",
      logo: '/images/logos/apple.png',
      brandId: 1
    },
    {
      id: 2,
      imageSrc: '/images/carousel/sky-streaming.jpg',
      title: 'Discover Sky Stream now!',
      description: 'Entertainment and sports streaming 🏆',
      brandName: 'SKY',
      logo: '/images/logos/sky.png',
      brandId: 2
    },
    {
      id: 3,
      imageSrc: '/images/levis.svg',
      title: "Levi's Exclusive",
      description: '20% student discount on all items',
      brandName: "LEVI'S",
      logo: '/images/logos/levis.png',
      brandId: 3
    },
    {
      id: 4,
      imageSrc: '/images/swarovski.svg',
      title: 'Swarovski Collection',
      description: 'Up to 30% off on selected items',
      brandName: 'SWAROVSKI',
      logo: '/images/logos/swarovski.png',
      brandId: 4
    }
  ];

  // Create seamless carousel by duplicating items (only if we have multiple brands)
  const extendedCarouselItems = brandCarouselItems.length > 1 
    ? [...brandCarouselItems, ...brandCarouselItems, ...brandCarouselItems]
    : brandCarouselItems; // Don't duplicate if only one brand

  console.log('Brand carousel items count:', brandCarouselItems.length);
  console.log('Extended carousel items count:', extendedCarouselItems.length);

  // Auto-advance carousel (only if we have multiple brands)
  useEffect(() => {
    if (brandCarouselItems.length > 1) {
      const timer = setInterval(() => {
        nextSlide();
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [brandCarouselItems.length]);

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
              <div 
                key={`${item.id}-${index}`} 
                className="carousel-card-wrapper"
                onClick={() => handleBrandClick(item.brandId, item.brandName)}
              >
                <ProductCard
                  id={item.id}
                  brand={item.brandName}
                  logo={item.logo}
                  imageSrc={item.imageSrc}
                  title={item.title}
                  description={item.description}
                  logoAlt={item.brandName}
                />
              </div>
            ))}
          </div>
          </div>
          {brandCarouselItems.length > 1 && (
            <>
              <button className="nav-btn prev" onClick={prevSlide}>
                <FaChevronLeft />
              </button>
              <button className="nav-btn next" onClick={nextSlide}>
                <FaChevronRight />
              </button>
            </>
          )}
        </div>
      </section>

      {/* Hot Deals Section */}
      <section className="hot-deals">
        <div className="container">
          <div className="section-header">
            <div className="section-title-row">
              <div className="section-title-content">
                <FaFire className="fire-icon" />
                <h2>Hot Deals</h2>
              </div>
              <button className="show-more" onClick={() => {
                // Navigate to first available offer to show OfferPage with all offers
                const firstOffer = featuredOffers[0] || electronicsOffers[0] || fashionOffers[0];
                if (firstOffer) {
                  navigate(`/offer/${firstOffer.id}`);
                }
              }}>
                Show more <span>→</span>
              </button>
            </div>
            <p>Don't miss out on these amazing student discounts!</p>
          </div>
          {loading ? (
            <div className="loading-spinner">Loading deals...</div>
          ) : (
            <div className="deals-grid">
              {featuredOffers.map((offer, index) => (
                <div key={offer.id || index} onClick={() => handleHotDealClick(offer.id)} style={{ cursor: 'pointer' }}>
                  <ProductCard
                    imageSrc={offer.image_url ? `http://localhost:5000${offer.image_url}` : '/images/placeholder.jpg'}
                    logo={offer.brand_logo ? `http://localhost:5000${offer.brand_logo}` : null}
                    brand={offer.brand_name}
                    title={offer.title}
                    description={`${offer.discount_percent}% off`}
                    logoAlt={offer.brand_name}
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
                <button className="show-more" onClick={() => {
                  // Navigate to first available offer to show OfferPage with all offers
                  const firstOffer = electronicsOffers[0] || featuredOffers[0] || fashionOffers[0];
                  if (firstOffer) {
                    navigate(`/offer/${firstOffer.id}`);
                  }
                }}>
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
                        logo={offer.brand_logo ? `http://localhost:5000${offer.brand_logo}` : null}
                        brand={offer.brand_name}
                        title={offer.title}
                        description={`${offer.discount_percent}% off`}
                        logoAlt={offer.brand_name}
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
                <button className="show-more" onClick={() => {
                  // Navigate to first available offer to show OfferPage with all offers
                  const firstOffer = fashionOffers[0] || featuredOffers[0] || electronicsOffers[0];
                  if (firstOffer) {
                    navigate(`/offer/${firstOffer.id}`);
                  }
                }}>
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
                        logo={offer.brand_logo ? `http://localhost:5000${offer.brand_logo}` : null}
                        brand={offer.brand_name}
                        title={offer.title}
                        description={`${offer.discount_percent}% off`}
                        logoAlt={offer.brand_name}
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
