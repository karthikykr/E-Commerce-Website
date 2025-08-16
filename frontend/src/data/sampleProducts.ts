// Sample data for when MongoDB is not connected
export const sampleCategories = [
  {
    _id: '1',
    name: 'Spices & Seasonings',
    slug: 'spices-seasonings',
    description: 'Premium quality spices and seasonings from around the world',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
    isActive: true,
    featured: true
  },
  {
    _id: '2',
    name: 'Herbs & Aromatics',
    slug: 'herbs-aromatics',
    description: 'Fresh and dried herbs for cooking and wellness',
    image: 'https://images.unsplash.com/photo-1515586838455-8b8b3e2b8e8e?w=400',
    isActive: true,
    featured: true
  },
  {
    _id: '3',
    name: 'Masala Blends',
    slug: 'masala-blends',
    description: 'Traditional and modern spice blends',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
    isActive: true,
    featured: true
  },
  {
    _id: '4',
    name: 'Organic Collection',
    slug: 'organic-collection',
    description: 'Certified organic spices and herbs',
    image: 'https://images.unsplash.com/photo-1515586838455-8b8b3e2b8e8e?w=400',
    isActive: true,
    featured: false
  }
];

export const sampleProducts = [
  {
    _id: '1',
    name: 'Premium Turmeric Powder',
    slug: 'premium-turmeric-powder',
    description: 'High-quality turmeric powder with rich color and aroma. Perfect for cooking and health benefits. Our turmeric is sourced from the finest farms and processed with care to retain maximum nutritional value.',
    shortDescription: 'Premium quality turmeric powder',
    price: 299,
    originalPrice: 399,
    category: {
      _id: '1',
      name: 'Spices & Seasonings',
      slug: 'spices-seasonings'
    },
    images: [{
      url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400',
      alt: 'Premium Turmeric Powder',
      isPrimary: true
    }],
    inStock: true,
    stockQuantity: 100,
    weight: { value: 250, unit: 'g' },
    origin: 'India',
    tags: ['turmeric', 'spice', 'healthy', 'organic'],
    rating: 4.8,
    reviewCount: 124,
    isFeatured: true,
    discountPercentage: 25
  },
  {
    _id: '2',
    name: 'Garam Masala Blend',
    slug: 'garam-masala-blend',
    description: 'Traditional Indian spice blend with perfect balance of warmth and flavor. Made from carefully selected whole spices that are roasted and ground to perfection.',
    shortDescription: 'Authentic garam masala blend',
    price: 199,
    originalPrice: 249,
    category: {
      _id: '3',
      name: 'Masala Blends',
      slug: 'masala-blends'
    },
    images: [{
      url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
      alt: 'Garam Masala Blend',
      isPrimary: true
    }],
    inStock: true,
    stockQuantity: 75,
    weight: { value: 100, unit: 'g' },
    origin: 'India',
    tags: ['garam-masala', 'blend', 'indian', 'traditional'],
    rating: 4.6,
    reviewCount: 89,
    isFeatured: true,
    discountPercentage: 20
  },
  {
    _id: '3',
    name: 'Organic Cardamom Pods',
    slug: 'organic-cardamom-pods',
    description: 'Premium organic green cardamom pods with intense aroma and flavor. These cardamom pods are hand-picked and carefully dried to preserve their natural oils and fragrance.',
    shortDescription: 'Organic green cardamom pods',
    price: 899,
    originalPrice: 999,
    category: {
      _id: '4',
      name: 'Organic Collection',
      slug: 'organic-collection'
    },
    images: [{
      url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400',
      alt: 'Organic Cardamom Pods',
      isPrimary: true
    }],
    inStock: true,
    stockQuantity: 50,
    weight: { value: 50, unit: 'g' },
    origin: 'Kerala, India',
    tags: ['cardamom', 'organic', 'premium', 'aromatic'],
    rating: 4.9,
    reviewCount: 67,
    isFeatured: false,
    discountPercentage: 10
  },
  {
    _id: '4',
    name: 'Fresh Basil Leaves',
    slug: 'fresh-basil-leaves',
    description: 'Fresh organic basil leaves perfect for cooking and garnishing. These aromatic leaves are carefully harvested and packed to maintain freshness and flavor.',
    shortDescription: 'Fresh organic basil leaves',
    price: 149,
    originalPrice: 149,
    category: {
      _id: '2',
      name: 'Herbs & Aromatics',
      slug: 'herbs-aromatics'
    },
    images: [{
      url: 'https://images.unsplash.com/photo-1515586838455-8b8b3e2b8e8e?w=400',
      alt: 'Fresh Basil Leaves',
      isPrimary: true
    }],
    inStock: true,
    stockQuantity: 30,
    weight: { value: 25, unit: 'g' },
    origin: 'Local Farms',
    tags: ['basil', 'fresh', 'herbs', 'organic'],
    rating: 4.4,
    reviewCount: 45,
    isFeatured: false,
    discountPercentage: 0
  },
  {
    _id: '5',
    name: 'Red Chili Powder',
    slug: 'red-chili-powder',
    description: 'Spicy red chili powder made from premium quality chilies. This vibrant red powder adds heat and color to your dishes while maintaining authentic flavor.',
    shortDescription: 'Premium red chili powder',
    price: 179,
    originalPrice: 199,
    category: {
      _id: '1',
      name: 'Spices & Seasonings',
      slug: 'spices-seasonings'
    },
    images: [{
      url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
      alt: 'Red Chili Powder',
      isPrimary: true
    }],
    inStock: true,
    stockQuantity: 80,
    weight: { value: 200, unit: 'g' },
    origin: 'Rajasthan, India',
    tags: ['chili', 'spicy', 'red', 'powder'],
    rating: 4.5,
    reviewCount: 92,
    isFeatured: true,
    discountPercentage: 10
  },
  {
    _id: '6',
    name: 'Cinnamon Sticks',
    slug: 'cinnamon-sticks',
    description: 'Premium Ceylon cinnamon sticks with sweet and warm flavor. These authentic cinnamon sticks are perfect for both sweet and savory dishes.',
    shortDescription: 'Premium Ceylon cinnamon sticks',
    price: 249,
    originalPrice: 299,
    category: {
      _id: '1',
      name: 'Spices & Seasonings',
      slug: 'spices-seasonings'
    },
    images: [{
      url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400',
      alt: 'Cinnamon Sticks',
      isPrimary: true
    }],
    inStock: true,
    stockQuantity: 60,
    weight: { value: 100, unit: 'g' },
    origin: 'Sri Lanka',
    tags: ['cinnamon', 'sweet', 'aromatic', 'ceylon'],
    rating: 4.7,
    reviewCount: 78,
    isFeatured: false,
    discountPercentage: 17
  },
  {
    _id: '7',
    name: 'Cumin Seeds',
    slug: 'cumin-seeds',
    description: 'Whole cumin seeds with earthy and warm flavor. These premium quality cumin seeds are essential for Indian cooking and add depth to any dish.',
    shortDescription: 'Premium whole cumin seeds',
    price: 159,
    originalPrice: 179,
    category: {
      _id: '1',
      name: 'Spices & Seasonings',
      slug: 'spices-seasonings'
    },
    images: [{
      url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
      alt: 'Cumin Seeds',
      isPrimary: true
    }],
    inStock: true,
    stockQuantity: 90,
    weight: { value: 200, unit: 'g' },
    origin: 'Gujarat, India',
    tags: ['cumin', 'seeds', 'earthy', 'indian'],
    rating: 4.3,
    reviewCount: 56,
    isFeatured: false,
    discountPercentage: 11
  },
  {
    _id: '8',
    name: 'Organic Black Pepper',
    slug: 'organic-black-pepper',
    description: 'Organic whole black peppercorns with intense flavor and aroma. These premium peppercorns are perfect for grinding fresh or using whole in cooking.',
    shortDescription: 'Organic whole black peppercorns',
    price: 399,
    originalPrice: 449,
    category: {
      _id: '4',
      name: 'Organic Collection',
      slug: 'organic-collection'
    },
    images: [{
      url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400',
      alt: 'Organic Black Pepper',
      isPrimary: true
    }],
    inStock: true,
    stockQuantity: 40,
    weight: { value: 100, unit: 'g' },
    origin: 'Kerala, India',
    tags: ['pepper', 'organic', 'peppercorns', 'spicy'],
    rating: 4.8,
    reviewCount: 103,
    isFeatured: true,
    discountPercentage: 11
  }
];
