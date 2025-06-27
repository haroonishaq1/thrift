import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import Header from '../components/Header';
import NavCategories from '../components/NavCategories';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { FaChevronLeft, FaChevronRight, FaFire } from 'react-icons/fa';

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
            <FaFire className="fire-icon" />
            <h2>Hot Deals</h2>
            <p>Don't miss out on these amazing student discounts!</p>
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

      {/* Featured Categories */}
      <section className="featured-categories">
        <div className="container">
          <h2>Shop by Category</h2>
          <div className="categories-grid">
            <div className="category-card" onClick={() => navigate('/category/fashion')}>
              <img src="/images/categories/fashion.jpg" alt="Fashion" />
              <h3>Fashion</h3>
              <p>Student discounts on clothing, shoes & accessories</p>
            </div>
            <div className="category-card" onClick={() => navigate('/category/technology')}>
              <img src="/images/categories/tech.jpg" alt="Technology" />
              <h3>Technology</h3>
              <p>Laptops, phones, gadgets & software at student prices</p>
            </div>
            <div className="category-card" onClick={() => navigate('/category/food-drink')}>
              <img src="/images/categories/food.jpg" alt="Food & Drink" />
              <h3>Food & Drink</h3>
              <p>Restaurants, cafes & food delivery discounts</p>
            </div>
            <div className="category-card" onClick={() => navigate('/category/entertainment')}>
              <img src="/images/categories/entertainment.jpg" alt="Entertainment" />
              <h3>Entertainment</h3>
              <p>Streaming, gaming, cinema & events</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
