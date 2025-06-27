import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import Header from '../components/Header';
import NavCategories from '../components/NavCategories';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { FaChevronLeft, FaChevronRight, FaFire, FaLaptop } from 'react-icons/fa';

function Home({ isLoggedIn }) {
  const [currentSlide, setCurrentSlide] = useState(5); // Start at index 5 (middle of extended array)
  const [itemsPerView, setItemsPerView] = useState(3);
  const navigate = useNavigate();

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

  // Featured deals data
  const featuredDeals = [
    {
      imageSrc: '/images/samsung-s25.jpg',
      logo: '/images/logos/samsung.png',
      title: 'The new Galaxy S25 Edge',
      description: '📱 ✨ Pre-order now and secure benefits.*',
      logoAlt: 'Samsung'
    },
    {
      imageSrc: '/images/grover-apple.jpg',
      logo: '/images/logos/grover.png',
      title: '15% off all Apple products every month',
      description: '🍎',
      logoAlt: 'Grover'
    },
    {
      imageSrc: '/images/nike-student.jpg',
      logo: '/images/logos/nike.png',
      title: 'Nike Student Discount',
      description: '👟 Get 10% off on all Nike products',
      logoAlt: 'Nike'
    },
    {
      imageSrc: '/images/spotify-premium.jpg',
      logo: '/images/logos/spotify.png',
      title: 'Spotify Premium Student',
      description: '🎵 50% off Premium for students',
      logoAlt: 'Spotify'
    }
  ];

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
          <div className="deals-grid">
            {featuredDeals.map((deal, index) => (
              <ProductCard
                key={index}
                imageSrc={deal.imageSrc}
                logo={deal.logo}
                title={deal.title}
                description={deal.description}
                logoAlt={deal.logoAlt}
              />
            ))}
          </div>
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
                <button className="show-more">
                  Show more <span>→</span>
                </button>
              </div>
              <p className="category-description">Need a new smartphone, MacBook, or laptop? From Apple to MediaMarkt: We have the best tech deals for students.</p>
            </div>
            
            <div className="category-offers-grid">
              <div className="offer-card">
                <div className="offer-image">
                  <img src="/images/categories/apple.jpg" alt="Apple" />
                </div>
                <div className="offer-content">
                  <h4>Save with Apple Education Pricing</h4>
                </div>
              </div>
              
              <div className="offer-card">
                <div className="offer-image">
                  <img src="/images/categories/mediamarkt.jpg" alt="MediaMarkt" />
                </div>
                <div className="offer-content">
                  <h4>Save 10€ on every order of 100€ or more</h4>
                </div>
              </div>
              
              <div className="offer-card">
                <div className="offer-image">
                  <img src="/images/categories/amazon-prime.jpg" alt="Amazon Prime" />
                </div>
                <div className="offer-content">
                  <h4>Prime Student Membership 6 months free for you</h4>
                </div>
              </div>
              
              <div className="offer-card">
                <div className="offer-image">
                  <img src="/images/categories/disney.jpg" alt="Disney+" />
                </div>
                <div className="offer-content">
                  <h4>Save over 15% with an annual subscription*</h4>
                </div>
              </div>
            </div>
          </div>
          
          <div className="category-section">
            <div className="category-header">
              <div className="category-title-section">
                <h3>Fashion</h3>
                <button className="show-more">
                  Show more <span>→</span>
                </button>
              </div>
              <p className="category-description">Stay stylish with the best fashion deals for students. From trendy clothing to accessories, find your perfect look for less.</p>
            </div>
            
            <div className="category-offers-grid">
              <div className="offer-card">
                <div className="offer-image">
                  <img src="/images/categories/hm.jpg" alt="H&M" />
                </div>
                <div className="offer-content">
                  <h4>H&M Student Discount 15% off</h4>
                </div>
              </div>
              
              <div className="offer-card">
                <div className="offer-image">
                  <img src="/images/categories/zara.jpg" alt="Zara" />
                </div>
                <div className="offer-content">
                  <h4>Zara Student Discount 10% off all items</h4>
                </div>
              </div>
              
              <div className="offer-card">
                <div className="offer-image">
                  <img src="/images/categories/adidas.jpg" alt="Adidas" />
                </div>
                <div className="offer-content">
                  <h4>Adidas Student Discount 20% off</h4>
                </div>
              </div>
              
              <div className="offer-card">
                <div className="offer-image">
                  <img src="/images/categories/nike-fashion.jpg" alt="Nike" />
                </div>
                <div className="offer-content">
                  <h4>Nike Student Discount 15% off fashion items</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
