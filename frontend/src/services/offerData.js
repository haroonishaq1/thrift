// Offer data service for Project Thrift

// Mock offer data
const mockOffers = [
  {
    id: '1',
    brand: 'Samsung',
    title: 'Samsung Galaxy S25 Pre-order',
    description: 'Get the latest Samsung Galaxy S25 with student discount',
    discount: '£150 off + Free Galaxy Buds',
    type: 'Online',
    category: 'Technology',
    image: '/images/carousel/samsung-s25.jpg',
    logo: '/images/logos/samsung.png',
    validUntil: '2025-12-31',
    terms: [
      'Valid student ID required',
      'Pre-order only - devices ship from March 2025',
      'Free Galaxy Buds with pre-order',
      'Cannot be combined with other offers',
      'Valid until December 31, 2025'
    ],
    rating: 4.8,
    reviews: 1247,
    redemptionUrl: 'https://samsung.com/student-deals',
    promoCode: 'STUDENT150'
  },
  {
    id: '2',
    brand: 'ARMEDANGELS',
    title: 'Sustainable Fashion Collection',
    description: 'Premium eco-friendly clothing for conscious consumers',
    discount: 'Up to 20% off',
    type: 'Online',
    category: 'Fashion',
    image: '/images/armedangels.jpg',
    logo: '/images/logos/armedangels.png',
    validUntil: '2025-12-31',
    terms: [
      'Valid student ID required',
      'Applies to full-price items only',
      'Free shipping on orders over £50',
      'Cannot be combined with other offers',
      'Valid until December 31, 2025'
    ],
    rating: 4.6,
    reviews: 892,
    redemptionUrl: 'https://armedangels.com/student',
    promoCode: 'STUDENT20'
  },
  {
    id: '3',
    brand: 'BOSS',
    title: 'Premium Collection',
    description: 'Luxury fashion at student prices',
    discount: '25% Student Discount',
    type: 'Online',
    category: 'Fashion',
    image: '/images/boss.jpg',
    logo: '/images/logos/boss.png',
    validUntil: '2025-12-31',
    terms: [
      'Valid student ID required',
      'Excludes sale items and accessories',
      'One-time use per customer',
      'Valid in-store and online',
      'Valid until December 31, 2025'
    ],
    rating: 4.7,
    reviews: 1456,
    redemptionUrl: 'https://boss.com/student-discount',
    promoCode: 'STUDENT25'
  },
  {
    id: '4',
    brand: 'MISSOMA',
    title: 'Jewelry Collection',
    description: 'Handcrafted jewelry pieces with student discount',
    discount: '15% off + Free Shipping',
    type: 'Online',
    category: 'Fashion',
    image: '/images/missoma.jpg',
    logo: '/images/logos/missoma.png',
    validUntil: '2025-12-31',
    terms: [
      'Valid student ID required',
      'Free shipping on all orders',
      'Applies to full-price items only',
      'Cannot be combined with other offers',
      'Valid until December 31, 2025'
    ],
    rating: 4.9,
    reviews: 734,
    redemptionUrl: 'https://missoma.com/student',
    promoCode: 'STUDENT15'
  },
  {
    id: '5',
    brand: 'SmartBuyGlasses',
    title: 'Designer Eyewear',
    description: 'Premium sunglasses and prescription glasses',
    discount: '20% student discount',
    type: 'Online',
    category: 'Fashion',
    image: '/images/smartbuyglasses.jpg',
    logo: '/images/logos/smartbuyglasses.png',
    validUntil: '2025-12-31',
    terms: [
      'Valid student ID required',
      'Applies to designer frames',
      'Free shipping and returns',
      'Cannot be combined with other offers',
      'Valid until December 31, 2025'
    ],
    rating: 4.5,
    reviews: 623,
    redemptionUrl: 'https://smartbuyglasses.com/student',
    promoCode: 'STUDENT20'
  }
];

// Mock redeemed codes data
const mockRedeemedCodes = [
  {
    id: '1',
    offerId: '1',
    brand: 'Samsung',
    title: 'Samsung Galaxy S25 Pre-order',
    code: 'SG25-STUD-4782',
    redeemedAt: '2025-06-01T10:30:00Z',
    validUntil: '2025-12-31T23:59:59Z',
    status: 'active',
    discount: '£150 off + Free Galaxy Buds'
  },
  {
    id: '2',
    offerId: '3',
    brand: 'BOSS',
    title: 'Premium Collection',
    code: 'BOSS-STUD-9123',
    redeemedAt: '2025-05-28T14:15:00Z',
    validUntil: '2025-12-31T23:59:59Z',
    status: 'used',
    discount: '25% Student Discount'
  }
];

// Service functions
export const getOfferById = (offerId) => {
  const offer = mockOffers.find(offer => offer.id === offerId);
  if (!offer) {
    throw new Error('Offer not found');
  }
  return offer;
};

export const getAllOffers = () => {
  return mockOffers;
};

export const getOffersByCategory = (category) => {
  return mockOffers.filter(offer => 
    offer.category.toLowerCase() === category.toLowerCase()
  );
};

export const getOffersByBrand = (brandName) => {
  return mockOffers.filter(offer => 
    offer.brand.toLowerCase() === brandName.toLowerCase()
  );
};

export const searchOffers = (searchTerm) => {
  const term = searchTerm.toLowerCase();
  return mockOffers.filter(offer => 
    offer.brand.toLowerCase().includes(term) ||
    offer.title.toLowerCase().includes(term) ||
    offer.description.toLowerCase().includes(term) ||
    offer.category.toLowerCase().includes(term)
  );
};

export const getFeaturedOffers = (limit = 4) => {
  // Return offers with highest ratings
  return mockOffers
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
};

export const getHotDeals = (limit = 6) => {
  // Return random selection of offers for hot deals
  const shuffled = [...mockOffers].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, limit);
};

// Redeem code functions
export const redeemOffer = async (offerId, userId) => {
  const offer = getOfferById(offerId);
  if (!offer) {
    throw new Error('Offer not found');
  }

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Generate a unique code
  const code = `${offer.brand.substring(0, 4).toUpperCase()}-STUD-${Math.floor(Math.random() * 10000)}`;
  
  const redeemedCode = {
    id: Date.now().toString(),
    offerId: offerId,
    brand: offer.brand,
    title: offer.title,
    code: code,
    redeemedAt: new Date().toISOString(),
    validUntil: offer.validUntil + 'T23:59:59Z',
    status: 'active',
    discount: offer.discount
  };

  // In a real app, this would be saved to the backend
  mockRedeemedCodes.push(redeemedCode);
  
  return redeemedCode;
};

export const getRedeemedCodes = (userId) => {
  // In a real app, this would filter by userId
  return mockRedeemedCodes;
};

export const getRedeemedCodeById = (codeId) => {
  const code = mockRedeemedCodes.find(code => code.id === codeId);
  if (!code) {
    throw new Error('Redeemed code not found');
  }
  return code;
};

export const markCodeAsUsed = (codeId) => {
  const code = mockRedeemedCodes.find(code => code.id === codeId);
  if (code) {
    code.status = 'used';
    code.usedAt = new Date().toISOString();
  }
  return code;
};

// Analytics functions (for brand dashboard)
export const getOfferAnalytics = (offerId) => {
  // Mock analytics data
  return {
    views: Math.floor(Math.random() * 10000) + 1000,
    clicks: Math.floor(Math.random() * 1000) + 100,
    redemptions: Math.floor(Math.random() * 500) + 50,
    conversionRate: ((Math.floor(Math.random() * 500) + 50) / (Math.floor(Math.random() * 1000) + 100) * 100).toFixed(2)
  };
};
