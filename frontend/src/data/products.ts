import { Product, ProductCategory } from '@/types';

// Sample Categories
export const categories: ProductCategory[] = [
  {
    id: '1',
    name: 'Whole Spices',
    slug: 'whole-spices',
    description: 'Fresh whole spices for maximum flavor and aroma',
    image: '🌶️'
  },
  {
    id: '2',
    name: 'Ground Spices',
    slug: 'ground-spices',
    description: 'Finely ground spices ready for cooking',
    image: '🥄'
  },
  {
    id: '3',
    name: 'Spice Blends',
    slug: 'spice-blends',
    description: 'Expertly crafted blends for authentic flavors',
    image: '🌿'
  },
  {
    id: '4',
    name: 'Herbs',
    slug: 'herbs',
    description: 'Fresh and dried herbs for cooking and seasoning',
    image: '🍃'
  },
  {
    id: '5',
    name: 'Seeds',
    slug: 'seeds',
    description: 'Aromatic seeds for tempering and flavoring',
    image: '🌰'
  }
];

// Sample Products
export const products: Product[] = [
  {
    id: '1',
    name: 'Organic Turmeric Powder',
    description: 'Premium organic turmeric powder with high curcumin content. Perfect for curries, golden milk, and health supplements.',
    price: 12.99,
    originalPrice: 15.99,
    category: categories[1], // Ground Spices
    images: ['/images/turmeric.jpg'],
    inStock: true,
    stockQuantity: 50,
    weight: '100g',
    origin: 'India',
    tags: ['organic', 'anti-inflammatory', 'golden milk'],
    rating: 4.8,
    reviewCount: 124,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Ceylon Cinnamon Sticks',
    description: 'Authentic Ceylon cinnamon sticks with sweet, delicate flavor. Perfect for baking, tea, and desserts.',
    price: 18.99,
    category: categories[0], // Whole Spices
    images: ['/images/cinnamon.jpg'],
    inStock: true,
    stockQuantity: 30,
    weight: '50g',
    origin: 'Sri Lanka',
    tags: ['ceylon', 'sweet', 'baking'],
    rating: 4.9,
    reviewCount: 89,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '3',
    name: 'Garam Masala Blend',
    description: 'Traditional Indian spice blend with cardamom, cinnamon, cloves, and more. Essential for authentic Indian cuisine.',
    price: 14.99,
    category: categories[2], // Spice Blends
    images: ['/images/garam-masala.jpg'],
    inStock: true,
    stockQuantity: 40,
    weight: '75g',
    origin: 'India',
    tags: ['indian', 'blend', 'curry'],
    rating: 4.7,
    reviewCount: 156,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: '4',
    name: 'Black Peppercorns',
    description: 'Premium whole black peppercorns with intense flavor and aroma. Freshly sourced from Malabar coast.',
    price: 16.99,
    category: categories[0], // Whole Spices
    images: ['/images/black-pepper.jpg'],
    inStock: true,
    stockQuantity: 60,
    weight: '100g',
    origin: 'India',
    tags: ['malabar', 'whole', 'premium'],
    rating: 4.6,
    reviewCount: 78,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08')
  },
  {
    id: '5',
    name: 'Smoked Paprika',
    description: 'Spanish smoked paprika with rich, smoky flavor. Perfect for paella, grilled meats, and vegetables.',
    price: 13.99,
    category: categories[1], // Ground Spices
    images: ['/images/paprika.jpg'],
    inStock: true,
    stockQuantity: 35,
    weight: '80g',
    origin: 'Spain',
    tags: ['smoked', 'spanish', 'paella'],
    rating: 4.8,
    reviewCount: 92,
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14')
  },
  {
    id: '6',
    name: 'Cardamom Pods',
    description: 'Green cardamom pods with intense aroma and flavor. Essential for Indian sweets, tea, and rice dishes.',
    price: 24.99,
    originalPrice: 29.99,
    category: categories[0], // Whole Spices
    images: ['/images/cardamom.jpg'],
    inStock: true,
    stockQuantity: 25,
    weight: '50g',
    origin: 'Guatemala',
    tags: ['green', 'aromatic', 'premium'],
    rating: 4.9,
    reviewCount: 67,
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-11')
  },
  {
    id: '7',
    name: 'Cumin Seeds',
    description: 'Whole cumin seeds with earthy, warm flavor. Perfect for tempering, grinding, and Middle Eastern cuisine.',
    price: 9.99,
    category: categories[4], // Seeds
    images: ['/images/cumin.jpg'],
    inStock: true,
    stockQuantity: 80,
    weight: '100g',
    origin: 'India',
    tags: ['earthy', 'tempering', 'middle-eastern'],
    rating: 4.5,
    reviewCount: 134,
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date('2024-01-09')
  },
  {
    id: '8',
    name: 'Dried Oregano',
    description: 'Mediterranean dried oregano with robust flavor. Perfect for pizza, pasta, and Mediterranean dishes.',
    price: 8.99,
    category: categories[3], // Herbs
    images: ['/images/oregano.jpg'],
    inStock: true,
    stockQuantity: 45,
    weight: '30g',
    origin: 'Greece',
    tags: ['mediterranean', 'pizza', 'pasta'],
    rating: 4.4,
    reviewCount: 98,
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13')
  },
  {
    id: '9',
    name: 'Star Anise',
    description: 'Whole star anise with sweet licorice flavor. Essential for Asian cuisine, mulled wine, and baking.',
    price: 19.99,
    category: categories[0], // Whole Spices
    images: ['/images/star-anise.jpg'],
    inStock: false,
    stockQuantity: 0,
    weight: '40g',
    origin: 'China',
    tags: ['licorice', 'asian', 'baking'],
    rating: 4.7,
    reviewCount: 45,
    createdAt: new Date('2024-01-07'),
    updatedAt: new Date('2024-01-07')
  },
  {
    id: '10',
    name: 'Curry Powder',
    description: 'Mild curry powder blend with turmeric, coriander, and cumin. Perfect for beginners to Indian cooking.',
    price: 11.99,
    category: categories[2], // Spice Blends
    images: ['/images/curry-powder.jpg'],
    inStock: true,
    stockQuantity: 55,
    weight: '100g',
    origin: 'India',
    tags: ['mild', 'beginner', 'indian'],
    rating: 4.3,
    reviewCount: 187,
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-06')
  }
];
