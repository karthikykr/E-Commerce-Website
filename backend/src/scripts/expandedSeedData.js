const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { User, Product, Category } = require('../models');

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/spice-store');
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const categories = [
  { name: 'Whole Spices', slug: 'whole-spices', description: 'Fresh whole spices for authentic flavors', image: '/images/categories/whole-spices.jpg', sortOrder: 1 },
  { name: 'Ground Spices', slug: 'ground-spices', description: 'Finely ground spices ready to use', image: '/images/categories/ground-spices.jpg', sortOrder: 2 },
  { name: 'Spice Blends', slug: 'spice-blends', description: 'Traditional and exotic spice blends', image: '/images/categories/spice-blends.jpg', sortOrder: 3 },
  { name: 'Herbs', slug: 'herbs', description: 'Fresh and dried herbs for cooking', image: '/images/categories/herbs.jpg', sortOrder: 4 },
  { name: 'Seeds', slug: 'seeds', description: 'Aromatic seeds for cooking and garnishing', image: '/images/categories/seeds.jpg', sortOrder: 5 },
  { name: 'Indian Masalas', slug: 'indian-masalas', description: 'Authentic Indian spice mixes and masalas', image: '/images/categories/indian-masalas.jpg', sortOrder: 6 },
  { name: 'International Spices', slug: 'international-spices', description: 'Exotic spices from around the world', image: '/images/categories/international-spices.jpg', sortOrder: 7 },
  { name: 'Organic Spices', slug: 'organic-spices', description: 'Certified organic spices and herbs', image: '/images/categories/organic-spices.jpg', sortOrder: 8 },
  { name: 'Tea & Beverages', slug: 'tea-beverages', description: 'Spiced teas and beverage mixes', image: '/images/categories/tea-beverages.jpg', sortOrder: 9 },
  { name: 'Cooking Essentials', slug: 'cooking-essentials', description: 'Essential ingredients for Indian cooking', image: '/images/categories/cooking-essentials.jpg', sortOrder: 10 }
];

const createProducts = (categories) => [
  // Ground Spices
  { name: 'Organic Turmeric Powder', slug: 'organic-turmeric-powder', price: 1079, originalPrice: 1329, category: categories[1]._id, stockQuantity: 50, weight: { value: 100, unit: 'g' }, origin: 'India', tags: ['organic', 'anti-inflammatory'], isFeatured: true },
  { name: 'Red Chili Powder', slug: 'red-chili-powder', price: 899, category: categories[1]._id, stockQuantity: 75, weight: { value: 100, unit: 'g' }, origin: 'India', tags: ['spicy', 'hot'] },
  { name: 'Coriander Powder', slug: 'coriander-powder', price: 649, category: categories[1]._id, stockQuantity: 60, weight: { value: 100, unit: 'g' }, origin: 'India', tags: ['aromatic'] },
  { name: 'Cumin Powder', slug: 'cumin-powder', price: 799, category: categories[1]._id, stockQuantity: 45, weight: { value: 100, unit: 'g' }, origin: 'India', tags: ['earthy'] },
  { name: 'Black Pepper Powder', slug: 'black-pepper-powder', price: 1299, category: categories[1]._id, stockQuantity: 30, weight: { value: 50, unit: 'g' }, origin: 'Kerala, India', tags: ['pungent'] },
  
  // Whole Spices
  { name: 'Ceylon Cinnamon Sticks', slug: 'ceylon-cinnamon-sticks', price: 1579, originalPrice: 1909, category: categories[0]._id, stockQuantity: 30, weight: { value: 50, unit: 'g' }, origin: 'Sri Lanka', tags: ['sweet', 'aromatic'], isFeatured: true },
  { name: 'Black Peppercorns', slug: 'black-peppercorns', price: 1419, category: categories[0]._id, stockQuantity: 60, weight: { value: 100, unit: 'g' }, origin: 'Kerala, India', tags: ['pungent', 'premium'] },
  { name: 'Green Cardamom Pods', slug: 'green-cardamom-pods', price: 2499, category: categories[0]._id, stockQuantity: 25, weight: { value: 50, unit: 'g' }, origin: 'Guatemala', tags: ['aromatic', 'premium'] },
  { name: 'Star Anise', slug: 'star-anise', price: 1899, category: categories[0]._id, stockQuantity: 20, weight: { value: 50, unit: 'g' }, origin: 'China', tags: ['licorice', 'sweet'] },
  { name: 'Cloves', slug: 'cloves', price: 1699, category: categories[0]._id, stockQuantity: 35, weight: { value: 50, unit: 'g' }, origin: 'Madagascar', tags: ['aromatic', 'warm'] },
  
  // Spice Blends
  { name: 'Garam Masala Blend', slug: 'garam-masala-blend', price: 1249, category: categories[2]._id, stockQuantity: 40, weight: { value: 100, unit: 'g' }, origin: 'India', tags: ['traditional', 'warming'] },
  { name: 'Biryani Masala', slug: 'biryani-masala', price: 1399, category: categories[2]._id, stockQuantity: 35, weight: { value: 100, unit: 'g' }, origin: 'India', tags: ['aromatic', 'rice'] },
  { name: 'Tandoori Masala', slug: 'tandoori-masala', price: 1199, category: categories[2]._id, stockQuantity: 30, weight: { value: 100, unit: 'g' }, origin: 'India', tags: ['smoky', 'grilling'] },
  { name: 'Curry Powder', slug: 'curry-powder', price: 1079, category: categories[2]._id, stockQuantity: 45, weight: { value: 100, unit: 'g' }, origin: 'India', tags: ['versatile', 'curry'] },
  { name: 'Chat Masala', slug: 'chat-masala', price: 899, category: categories[2]._id, stockQuantity: 50, weight: { value: 100, unit: 'g' }, origin: 'India', tags: ['tangy', 'street food'] },
  
  // Herbs
  { name: 'Dried Oregano', slug: 'dried-oregano', price: 749, category: categories[3]._id, stockQuantity: 35, weight: { value: 50, unit: 'g' }, origin: 'Mediterranean', tags: ['pizza', 'pasta'] },
  { name: 'Dried Basil', slug: 'dried-basil', price: 849, category: categories[3]._id, stockQuantity: 40, weight: { value: 50, unit: 'g' }, origin: 'Italy', tags: ['aromatic', 'italian'] },
  { name: 'Dried Thyme', slug: 'dried-thyme', price: 899, category: categories[3]._id, stockQuantity: 30, weight: { value: 50, unit: 'g' }, origin: 'France', tags: ['earthy', 'french'] },
  { name: 'Rosemary', slug: 'rosemary', price: 999, category: categories[3]._id, stockQuantity: 25, weight: { value: 50, unit: 'g' }, origin: 'Mediterranean', tags: ['piney', 'aromatic'] },
  { name: 'Dried Mint Leaves', slug: 'dried-mint-leaves', price: 699, category: categories[3]._id, stockQuantity: 45, weight: { value: 50, unit: 'g' }, origin: 'India', tags: ['refreshing', 'cooling'] },
  
  // Seeds
  { name: 'Cumin Seeds', slug: 'cumin-seeds', price: 999, category: categories[4]._id, stockQuantity: 45, weight: { value: 100, unit: 'g' }, origin: 'India', tags: ['earthy', 'tempering'] },
  { name: 'Mustard Seeds', slug: 'mustard-seeds', price: 649, category: categories[4]._id, stockQuantity: 55, weight: { value: 100, unit: 'g' }, origin: 'India', tags: ['pungent', 'tempering'] },
  { name: 'Fennel Seeds', slug: 'fennel-seeds', price: 899, category: categories[4]._id, stockQuantity: 40, weight: { value: 100, unit: 'g' }, origin: 'India', tags: ['sweet', 'digestive'] },
  { name: 'Fenugreek Seeds', slug: 'fenugreek-seeds', price: 749, category: categories[4]._id, stockQuantity: 35, weight: { value: 100, unit: 'g' }, origin: 'India', tags: ['bitter', 'medicinal'] },
  { name: 'Nigella Seeds (Kalonji)', slug: 'nigella-seeds', price: 1199, category: categories[4]._id, stockQuantity: 30, weight: { value: 100, unit: 'g' }, origin: 'India', tags: ['nutty', 'medicinal'] },
  
  // Indian Masalas
  { name: 'Rajma Masala', slug: 'rajma-masala', price: 1299, category: categories[5]._id, stockQuantity: 25, weight: { value: 100, unit: 'g' }, origin: 'India', tags: ['kidney beans', 'north indian'] },
  { name: 'Chole Masala', slug: 'chole-masala', price: 1199, category: categories[5]._id, stockQuantity: 30, weight: { value: 100, unit: 'g' }, origin: 'India', tags: ['chickpeas', 'punjabi'] },
  { name: 'Sambar Powder', slug: 'sambar-powder', price: 1099, category: categories[5]._id, stockQuantity: 35, weight: { value: 100, unit: 'g' }, origin: 'South India', tags: ['lentils', 'south indian'] },
  { name: 'Rasam Powder', slug: 'rasam-powder', price: 999, category: categories[5]._id, stockQuantity: 40, weight: { value: 100, unit: 'g' }, origin: 'South India', tags: ['tangy', 'soup'] },
  { name: 'Pav Bhaji Masala', slug: 'pav-bhaji-masala', price: 1149, category: categories[5]._id, stockQuantity: 30, weight: { value: 100, unit: 'g' }, origin: 'Mumbai, India', tags: ['street food', 'vegetables'] },
  
  // International Spices
  { name: 'Paprika', slug: 'paprika', price: 1399, category: categories[6]._id, stockQuantity: 25, weight: { value: 100, unit: 'g' }, origin: 'Hungary', tags: ['sweet', 'colorful'] },
  { name: 'Sumac', slug: 'sumac', price: 1899, category: categories[6]._id, stockQuantity: 20, weight: { value: 100, unit: 'g' }, origin: 'Middle East', tags: ['tangy', 'lemony'] },
  { name: 'Za\'atar', slug: 'zaatar', price: 1699, category: categories[6]._id, stockQuantity: 25, weight: { value: 100, unit: 'g' }, origin: 'Lebanon', tags: ['herbal', 'middle eastern'] },
  { name: 'Chinese Five Spice', slug: 'chinese-five-spice', price: 1499, category: categories[6]._id, stockQuantity: 30, weight: { value: 100, unit: 'g' }, origin: 'China', tags: ['balanced', 'asian'] },
  { name: 'Herbes de Provence', slug: 'herbes-de-provence', price: 1799, category: categories[6]._id, stockQuantity: 20, weight: { value: 100, unit: 'g' }, origin: 'France', tags: ['lavender', 'french'] },
  
  // Organic Spices
  { name: 'Organic Black Pepper', slug: 'organic-black-pepper', price: 1899, category: categories[7]._id, stockQuantity: 25, weight: { value: 100, unit: 'g' }, origin: 'Kerala, India', tags: ['organic', 'certified'] },
  { name: 'Organic Cinnamon Powder', slug: 'organic-cinnamon-powder', price: 1599, category: categories[7]._id, stockQuantity: 30, weight: { value: 100, unit: 'g' }, origin: 'Sri Lanka', tags: ['organic', 'sweet'] },
  { name: 'Organic Ginger Powder', slug: 'organic-ginger-powder', price: 1299, category: categories[7]._id, stockQuantity: 35, weight: { value: 100, unit: 'g' }, origin: 'India', tags: ['organic', 'warming'] },
  { name: 'Organic Cardamom Powder', slug: 'organic-cardamom-powder', price: 2999, category: categories[7]._id, stockQuantity: 15, weight: { value: 50, unit: 'g' }, origin: 'Guatemala', tags: ['organic', 'premium'] },
  
  // Tea & Beverages
  { name: 'Masala Chai Mix', slug: 'masala-chai-mix', price: 899, category: categories[8]._id, stockQuantity: 50, weight: { value: 100, unit: 'g' }, origin: 'India', tags: ['tea', 'warming'] },
  { name: 'Golden Milk Mix', slug: 'golden-milk-mix', price: 1199, category: categories[8]._id, stockQuantity: 40, weight: { value: 100, unit: 'g' }, origin: 'India', tags: ['turmeric', 'healthy'] },
  { name: 'Kahwa Tea Mix', slug: 'kahwa-tea-mix', price: 1499, category: categories[8]._id, stockQuantity: 25, weight: { value: 100, unit: 'g' }, origin: 'Kashmir, India', tags: ['saffron', 'premium'] },
  { name: 'Thandai Mix', slug: 'thandai-mix', price: 1299, category: categories[8]._id, stockQuantity: 30, weight: { value: 100, unit: 'g' }, origin: 'India', tags: ['cooling', 'festival'] },
  
  // Cooking Essentials
  { name: 'Hing (Asafoetida)', slug: 'hing-asafoetida', price: 1999, category: categories[9]._id, stockQuantity: 20, weight: { value: 50, unit: 'g' }, origin: 'Afghanistan', tags: ['pungent', 'digestive'] },
  { name: 'Tamarind Paste', slug: 'tamarind-paste', price: 799, category: categories[9]._id, stockQuantity: 45, weight: { value: 200, unit: 'g' }, origin: 'India', tags: ['tangy', 'souring'] },
  { name: 'Jaggery Powder', slug: 'jaggery-powder', price: 649, category: categories[9]._id, stockQuantity: 60, weight: { value: 500, unit: 'g' }, origin: 'India', tags: ['natural', 'sweetener'] },
  { name: 'Curry Leaves (Dried)', slug: 'curry-leaves-dried', price: 899, category: categories[9]._id, stockQuantity: 35, weight: { value: 50, unit: 'g' }, origin: 'South India', tags: ['aromatic', 'tempering'] },
  { name: 'Kokum', slug: 'kokum', price: 1399, category: categories[9]._id, stockQuantity: 25, weight: { value: 100, unit: 'g' }, origin: 'Western India', tags: ['tangy', 'cooling'] }
];

const seedExpandedData = async () => {
  try {
    await connectDB();
    
    console.log('Starting expanded data seeding...');
    
    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    
    console.log('Existing products and categories cleared');
    
    // Create categories
    const createdCategories = await Category.create(categories);
    console.log('Categories created:', createdCategories.length);
    
    // Create products with full details
    const productData = createProducts(createdCategories);
    const productsWithDetails = productData.map(product => ({
      ...product,
      description: product.description || `High-quality ${product.name.toLowerCase()} sourced from ${product.origin}. Perfect for authentic cooking and exceptional flavor.`,
      shortDescription: product.shortDescription || `Premium ${product.name.toLowerCase()} from ${product.origin}`,
      images: product.images || [{ url: `/images/products/${product.slug}.jpg`, alt: product.name, isPrimary: true }],
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // Random rating between 3.0-5.0
      reviewCount: Math.floor(Math.random() * 50) + 5, // Random review count 5-55
      isActive: true,
      nutritionalInfo: product.nutritionalInfo || {
        calories: Math.floor(Math.random() * 200) + 250,
        protein: Math.round((Math.random() * 10 + 5) * 10) / 10,
        carbohydrates: Math.round((Math.random() * 30 + 40) * 10) / 10,
        fat: Math.round((Math.random() * 10 + 2) * 10) / 10,
        fiber: Math.round((Math.random() * 15 + 5) * 10) / 10
      },
      storageInstructions: 'Store in a cool, dry place away from direct sunlight. Keep container tightly closed.'
    }));
    
    const createdProducts = await Product.create(productsWithDetails);
    console.log('Products created:', createdProducts.length);
    
    console.log('=================================');
    console.log('EXPANDED DATABASE SEEDED SUCCESSFULLY!');
    console.log(`Categories: ${createdCategories.length}`);
    console.log(`Products: ${createdProducts.length}`);
    console.log('=================================');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding expanded data:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedExpandedData();
}

module.exports = { seedExpandedData };
