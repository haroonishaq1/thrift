import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import Header from '../components/Header';
import NavCategories from '../components/NavCategories';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { FaChevronLeft, FaChevronRight, FaFire } from 'react-icons/fa';

function Home({ isLoggedIn }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const carouselItems = [
    {
      id: 1,
      imageSrc: '/images/levis.svg',
      title: "Levi's Exclusive",
      description: '20% student discount on all items',
      brandName: "LEVI'S",
    },
    {
      id: 2,
      imageSrc: '/images/swarovski.svg',
      title: 'Swarovski Collection',
      description: 'Up to 30% off on selected items',
      brandName: 'SWAROVSKI',
    },
    {
      id: 3,
      imageSrc: '/images/levis.svg',
      title: "Levi's",
      description: '20% off on all denim',
      logo: '/images/logos/levis.png',
    },
    {
      id: 4,
      imageSrc: '/images/swarovski.svg',
      title: 'Swarovski',
      description: '25% student discount on selected items',
      logo: '/images/logos/swarovski.png',
    },
    {
      id: 5,
      imageSrc: '/images/carousel/wow-sport.jpg',
      title: 'WOW Sport',
      description: '40% off annual subscription',
      logo: '/images/logos/wow.png',
    },
    {
      id: 6,
      imageSrc: '/images/carousel/sky-streaming.jpg',
      title: 'Sky Streaming',
      description: '50% off for students',
      logo: '/images/logos/sky.png',
    }
  ];

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => 
        prevSlide === Math.ceil(carouselItems.length / 4) - 1 ? 0 : prevSlide + 1
      );
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselItems.length]);

  const nextSlide = () => {
    setCurrentSlide(currentSlide === Math.ceil(carouselItems.length / 4) - 1 ? 0 : currentSlide + 1);
  };

  const prevSlide = () => {
    setCurrentSlide(currentSlide === 0 ? Math.ceil(carouselItems.length / 4) - 1 : currentSlide - 1);
  };

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
      imageSrc: '/images/wow-sport.jpg',
      logo: '/images/logos/wow.png',
      title: 'WOW Live Sport -40% for only €21.50 per month.',
      description: '',
      logoAlt: 'WOW'
    }
  ];

  return (
    <div className="home">
      <Header isLoggedIn={isLoggedIn} />
      <NavCategories />
      
      {/* Hero Section with Carousel */}
      <section className="hero-carousel">
        <div className="carousel-container">
          <div className="carousel-content">
            <div className="carousel-items" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {carouselItems.map((item, index) => (
                <div key={item.id} className="carousel-item">
                  <div className="carousel-image">
                    <img src={item.imageSrc} alt={item.title} />
                  </div>
                  <div className="carousel-text">
                    <h2>{item.title}</h2>
                    <p>{item.description}</p>
                    <button 
                      className="shop-now-btn"
                      onClick={() => navigate(`/brand/${item.brandName || item.title}`)}
                    >
                      Shop Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="carousel-btn prev" onClick={prevSlide}>
            <FaChevronLeft />
          </button>
          <button className="carousel-btn next" onClick={nextSlide}>
            <FaChevronRight />
          </button>
          <div className="carousel-indicators">
            {Array.from({ length: Math.ceil(carouselItems.length / 4) }).map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
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
