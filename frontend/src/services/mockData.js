// Mock product data for different categories
const mockProducts = {
  fashion: [
    {
      id: 1,
      brand: "Persol",
      title: "Premium Sunglasses",
      description: "Enjoy your student discount at Persol!",
      image: "/images/carousel/persol-sunglasses.jpg",
      logo: "/images/logos/persol.png",
      discount: "20% student discount"
    },
    {
      id: 2,
      brand: "ARMEDANGELS",
      title: "Sustainable Fashion",
      description: "Premium eco-friendly clothing for conscious consumers",
      image: "/images/armedangels.jpg",
      logo: "/images/logos/armedangels.png",
      discount: "Up to 20% off"
    },
    {
      id: 3,
      brand: "BOSS",
      title: "Premium Collection",
      description: "Luxury fashion at student prices",
      image: "/images/boss.jpg",
      logo: "/images/logos/boss.png",
      discount: "25% Student Discount"
    },
    {
      id: 4,
      brand: "MISSOMA",
      title: "Jewelry Collection",
      description: "Handcrafted jewelry pieces",
      image: "/images/missoma.jpg",
      logo: "/images/logos/missoma.png",
      discount: "15% off + Free Shipping"
    }
  ],
  technology: [
    {
      id: 5,
      brand: "Samsung",
      title: "Samsung Galaxy S25",
      description: "Pre-order the latest innovation",
      image: "/images/carousel/samsung-s25.jpg",
      logo: "/images/logos/samsung.png",
      discount: "£150 off + Free Galaxy Buds"
    },
    {
      id: 6,
      brand: "Apple",
      title: "Student Apple Store",
      description: "Special pricing on Mac and iPad",
      image: "/images/carousel/apple-promo.jpg",
      logo: "/images/logos/apple.png",
      discount: "Up to £150 off + Free AirPods"
    },
    {
      id: 7,
      brand: "Sky",
      title: "Sky Stream & Netflix",
      description: "Entertainment bundle for students",
      image: "/images/carousel/sky-streaming.jpg",
      logo: "/images/logos/sky.png",
      discount: "25% off for 12 months"
    }
  ]
};

// Function to simulate API call delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to get products by category with pagination
export const getProductsByCategory = async (category, page = 1, limit = 10) => {
  await delay(800); // Simulate network delay
  
  const products = mockProducts[category.toLowerCase()] || [];
  const start = (page - 1) * limit;
  const end = start + limit;
  const slicedProducts = products.slice(start, end);
  
  return {
    products: slicedProducts,
    hasMore: end < products.length
  };
};

export default {
  getProductsByCategory
};
