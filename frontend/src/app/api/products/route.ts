import { NextRequest, NextResponse } from 'next/server';

// Mock products data that matches the cart system
const mockProducts = [
  {
    id: "1",
    _id: "1", // Add both formats for compatibility
    name: "Organic Turmeric Powder",
    description: "Premium organic turmeric powder with high curcumin content. Perfect for curries, golden milk, and health supplements.",
    shortDescription: "Premium organic turmeric powder with high curcumin content.",
    price: 12.99,
    originalPrice: 15.99,
    category: {
      id: "2",
      _id: "2",
      name: "Ground Spices",
      slug: "ground-spices",
      description: "Finely ground spices ready for cooking",
      image: "🌿"
    },
    images: ["/images/turmeric.jpg"],
    inStock: true,
    stockQuantity: 50,
    weight: "100g",
    origin: "India",
    tags: ["organic", "anti-inflammatory", "golden milk"],
    rating: 4.8,
    reviewCount: 124,
    isFeatured: true,
    discountPercentage: 19,
    createdAt: "2024-01-15T00:00:00.000Z",
    updatedAt: "2024-01-15T00:00:00.000Z"
  },
  {
    id: "2",
    _id: "2",
    name: "Whole Black Peppercorns",
    description: "Premium whole black peppercorns with intense flavor and aroma. Perfect for grinding fresh pepper.",
    shortDescription: "Premium whole black peppercorns with intense flavor.",
    price: 18.99,
    originalPrice: 22.99,
    category: {
      id: "1",
      _id: "1",
      name: "Whole Spices",
      slug: "whole-spices",
      description: "Whole spices for maximum flavor",
      image: "🌶️"
    },
    images: ["/images/black-pepper.jpg"],
    inStock: true,
    stockQuantity: 75,
    weight: "200g",
    origin: "Kerala, India",
    tags: ["whole", "pepper", "premium"],
    rating: 4.6,
    reviewCount: 89,
    isFeatured: true,
    discountPercentage: 17,
    createdAt: "2024-01-10T00:00:00.000Z",
    updatedAt: "2024-01-10T00:00:00.000Z"
  },
  {
    id: "3",
    _id: "3",
    name: "Organic Cumin Seeds",
    description: "Aromatic organic cumin seeds with earthy flavor. Essential for Indian, Mexican, and Middle Eastern cuisines.",
    shortDescription: "Aromatic organic cumin seeds with earthy flavor.",
    price: 14.99,
    originalPrice: 17.99,
    category: {
      id: "3",
      _id: "3",
      name: "Seeds",
      slug: "seeds",
      description: "Aromatic seeds and spices",
      image: "🌱"
    },
    images: ["/images/cumin-seeds.jpg"],
    inStock: true,
    stockQuantity: 60,
    weight: "150g",
    origin: "Gujarat, India",
    tags: ["organic", "seeds", "earthy"],
    rating: 4.7,
    reviewCount: 156,
    isFeatured: false,
    discountPercentage: 17,
    createdAt: "2024-01-12T00:00:00.000Z",
    updatedAt: "2024-01-12T00:00:00.000Z"
  },
  {
    id: "4",
    _id: "4",
    name: "Dried Bay Leaves",
    description: "Premium dried bay leaves with aromatic flavor. Perfect for soups, stews, and rice dishes.",
    shortDescription: "Premium dried bay leaves with aromatic flavor.",
    price: 9.99,
    originalPrice: 12.99,
    category: {
      id: "4",
      _id: "4",
      name: "Herbs",
      slug: "herbs",
      description: "Fresh and dried herbs",
      image: "🍃"
    },
    images: ["/images/bay-leaves.jpg"],
    inStock: true,
    stockQuantity: 40,
    weight: "50g",
    origin: "Turkey",
    tags: ["herbs", "aromatic", "cooking"],
    rating: 4.5,
    reviewCount: 67,
    isFeatured: false,
    discountPercentage: 23,
    createdAt: "2024-01-08T00:00:00.000Z",
    updatedAt: "2024-01-08T00:00:00.000Z"
  },
  {
    id: "5",
    _id: "5",
    name: "Garam Masala Blend",
    description: "Traditional garam masala blend with perfect balance of spices. Ideal for Indian curries and dishes.",
    shortDescription: "Traditional garam masala blend with perfect balance.",
    price: 16.99,
    originalPrice: 19.99,
    category: {
      id: "5",
      _id: "5",
      name: "Spice Blends",
      slug: "spice-blends",
      description: "Expertly crafted spice blends",
      image: "🌶️"
    },
    images: ["/images/garam-masala.jpg"],
    inStock: true,
    stockQuantity: 35,
    weight: "100g",
    origin: "India",
    tags: ["blend", "indian", "traditional"],
    rating: 4.9,
    reviewCount: 203,
    isFeatured: true,
    discountPercentage: 15,
    createdAt: "2024-01-20T00:00:00.000Z",
    updatedAt: "2024-01-20T00:00:00.000Z"
  }
];

const mockCategories = [
  {
    id: "1",
    _id: "1",
    name: "Whole Spices",
    slug: "whole-spices",
    description: "Whole spices for maximum flavor",
    image: "🌶️"
  },
  {
    id: "2",
    _id: "2",
    name: "Ground Spices",
    slug: "ground-spices",
    description: "Finely ground spices ready for cooking",
    image: "🌿"
  },
  {
    id: "3",
    _id: "3",
    name: "Seeds",
    slug: "seeds",
    description: "Aromatic seeds and spices",
    image: "🌱"
  },
  {
    id: "4",
    _id: "4",
    name: "Herbs",
    slug: "herbs",
    description: "Fresh and dried herbs",
    image: "🍃"
  },
  {
    id: "5",
    _id: "5",
    name: "Spice Blends",
    slug: "spice-blends",
    description: "Expertly crafted spice blends",
    image: "🌶️"
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let filteredProducts = [...mockProducts];

    // Filter by category
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(product => 
        product.category.slug === category
      );
    }

    // Filter by search query
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort products
    if (sort) {
      switch (sort) {
        case 'price-low':
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filteredProducts.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        default:
          // Default sort by featured, then by rating
          filteredProducts.sort((a, b) => {
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            return b.rating - a.rating;
          });
      }
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    const totalPages = Math.ceil(filteredProducts.length / limit);

    return NextResponse.json({
      success: true,
      products: paginatedProducts,
      categories: mockCategories,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: filteredProducts.length,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error in products API:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
