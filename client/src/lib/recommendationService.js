// A simple recommendation service based on product categories, user history, and popular items

// Helper function to get unique items by id
const getUniqueItemsById = (items) => {
  const uniqueItems = [];
  const seenIds = new Set();
  
  items.forEach(item => {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      uniqueItems.push(item);
    }
  });
  
  return uniqueItems;
};

// Get recommendations based on category
export const getRelatedProducts = (products, currentProduct, limit = 4) => {
  if (!currentProduct || !Array.isArray(products) || products.length === 0) {
    return [];
  }
  
  // First, get products in the same category
  const sameCategory = products.filter(
    product => 
      product.id !== currentProduct.id && 
      product.category === currentProduct.category
  );
  
  // If we have enough products in the same category, return them
  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }
  
  // Otherwise, add products from related categories
  const relatedCategories = getRelatedCategories(currentProduct.category);
  const relatedProducts = products.filter(
    product => 
      product.id !== currentProduct.id && 
      !sameCategory.some(p => p.id === product.id) && 
      relatedCategories.includes(product.category)
  );
  
  // Combine and return
  return getUniqueItemsById([...sameCategory, ...relatedProducts]).slice(0, limit);
};

// Get recommendations based on user's purchase history
export const getPersonalizedRecommendations = (products, user, limit = 4) => {
  if (!user || !Array.isArray(products) || products.length === 0) {
    return getPopularProducts(products, limit);
  }
  
  // Get categories from user's order history
  const userCategories = new Set();
  const purchasedProductIds = new Set();
  
  if (user.orders && user.orders.length > 0) {
    user.orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          purchasedProductIds.add(item.id);
          
          // Find the product to get its category
          const product = products.find(p => p.id === item.id);
          if (product) {
            userCategories.add(product.category);
          }
        });
      }
    });
  }
  
  // Filter products by categories user has purchased from
  // but exclude products they've already bought
  let recommendations = products.filter(
    product => 
      !purchasedProductIds.has(product.id) && 
      userCategories.has(product.category)
  );
  
  // If we don't have enough recommendations, add popular products
  if (recommendations.length < limit) {
    const popular = getPopularProducts(products, limit).filter(
      product => !purchasedProductIds.has(product.id)
    );
    
    recommendations = getUniqueItemsById([...recommendations, ...popular]);
  }
  
  return recommendations.slice(0, limit);
};

// Get popular products based on ratings and review count
export const getPopularProducts = (products, limit = 4) => {
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }
  
  // Sort by a combination of rating and review count
  return [...products]
    .sort((a, b) => {
      // Calculate a score (rating * sqrt(reviews))
      const scoreA = (a.rating || 0) * Math.sqrt(a.reviews || 0);
      const scoreB = (b.rating || 0) * Math.sqrt(b.reviews || 0);
      return scoreB - scoreA;
    })
    .slice(0, limit);
};

// Get recommendations for a specific category
export const getCategoryRecommendations = (products, category, limit = 4) => {
  if (!category || !Array.isArray(products) || products.length === 0) {
    return [];
  }
  
  // Get products in the requested category
  const categoryProducts = products.filter(
    product => product.category === category
  );
  
  // If we have enough products, sort by popularity and return
  if (categoryProducts.length >= limit) {
    return getPopularProducts(categoryProducts, limit);
  }
  
  // Otherwise, add products from related categories
  const relatedCategories = getRelatedCategories(category);
  const relatedProducts = products.filter(
    product => 
      !categoryProducts.some(p => p.id === product.id) && 
      relatedCategories.includes(product.category)
  );
  
  // Combine, sort by popularity, and return
  return getPopularProducts(
    getUniqueItemsById([...categoryProducts, ...relatedProducts]),
    limit
  );
};

// Define related categories
const getRelatedCategories = (category) => {
  const relationMap = {
    seeds: ['plants', 'fertilizer', 'gardening'],
    plants: ['seeds', 'fertilizer', 'gardening'],
    milk: ['food', 'beverages', 'dairy-alternatives'],
    food: ['milk', 'beverages', 'dairy-alternatives'],
    tofu: ['food', 'protein', 'dairy-alternatives'],
    protein: ['tofu', 'food', 'dairy-alternatives'],
    beverages: ['milk', 'food', 'dairy-alternatives'],
    'dairy-alternatives': ['milk', 'tofu', 'food'],
    gardening: ['seeds', 'plants', 'fertilizer'],
    fertilizer: ['seeds', 'plants', 'gardening']
  };
  
  return relationMap[category] || [];
};

// Get "Frequently Bought Together" recommendations
export const getFrequentlyBoughtTogether = (products, currentProduct, limit = 3) => {
  if (!currentProduct || !Array.isArray(products) || products.length === 0) {
    return [];
  }
  
  // In a real application, this would use actual purchase data to find items
  // frequently bought together. For now, we'll simulate based on categories.
  
  // Define complementary categories
  const complementaryMap = {
    seeds: ['gardening', 'fertilizer'],
    plants: ['gardening', 'fertilizer'],
    milk: ['food'],
    food: ['beverages'],
    tofu: ['food', 'protein'],
    protein: ['beverages'],
    beverages: ['food'],
    gardening: ['seeds', 'plants'],
    fertilizer: ['seeds', 'plants']
  };
  
  const complementaryCategories = complementaryMap[currentProduct.category] || [];
  
  // Get complementary products
  const complementary = products.filter(
    product => 
      product.id !== currentProduct.id && 
      complementaryCategories.includes(product.category)
  );
  
  return complementary.slice(0, limit);
};