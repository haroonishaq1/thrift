import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import '../styles/CategoryPage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NavCategories from '../components/NavCategories';
import { getProductsByCategory } from '../services/mockData';

function CategoryPage() {
  const { category } = useParams();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const result = await getProductsByCategory(category, 1);
        setProducts(result.products);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    setPage(1);
  }, [category]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % products.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + products.length) % products.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (loading && products.length === 0) {
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
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </h1>
        
        {/* Category Carousel */}
        <section className="category-carousel">
          {products.length > 0 && (
            <>
              <button 
                className="carousel-btn prev" 
                onClick={prevSlide}
                aria-label="Previous slide"
              >
                <FaChevronLeft />
              </button>
              
              <div className="carousel-container">
                {products.map((product, index) => (
                  <div 
                    key={product.id} 
                    className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                    style={{
                      transform: `translateX(${(index - currentSlide) * 100}%)`
                    }}
                  >
                    <div className="slide-content">
                      <div className="brand-logo">
                        <img src={product.logo} alt={product.brand} />
                      </div>
                      <div className="slide-info">
                        <h2 className="discount-text">{product.discount}</h2>
                        <p className="description">{product.description}</p>
                      </div>
                      <div className="slide-image">
                        <img src={product.image} alt={product.title} />
                      </div>
                      <button className="redeem-btn">
                        Redeem now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                className="carousel-btn next" 
                onClick={nextSlide}
                aria-label="Next slide"
              >
                <FaChevronRight />
              </button>

              <div className="carousel-dots">
                {products.map((_, index) => (
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
